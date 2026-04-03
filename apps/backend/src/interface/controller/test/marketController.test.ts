import { expect, describe, it, mock, beforeEach } from 'bun:test';
import { MarketController } from '../marketController';
import { createMockContext } from '../../test/testHelpers';
import { AppVariables, Bindings } from '../../types';

interface MockResponse {
  body: Record<string, unknown> & { indicators?: string[], sessions?: unknown[], currentCondition?: string, message?: string, points?: unknown[], error?: string, previousEvent?: unknown, candles?: unknown[], historicalStats?: unknown[] };
  status: number;
}

describe('MarketController', () => {

  let mockRepos: Partial<AppVariables>;
  let mockEnv: Partial<Bindings>;

  beforeEach(() => {
    mockRepos = {
      sessionRepo: {
        getRecentEventNames: mock(() => Promise.resolve(['CPI', '雇用統計'])),
        findRecentSessions: mock(() => Promise.resolve([])),
        findPreviousEvent: mock(() => Promise.resolve(null)),
        getCandles: mock(() => Promise.resolve([])),
        getThresholds: mock(() => Promise.resolve({})),
        getEventStats: mock(() => Promise.resolve([]))
      } as unknown as AppVariables['sessionRepo'],
      priceRepo: {
        getLatestPrice: mock(() => Promise.resolve({ timestamp: 'now', open: 1, high: 2, low: 0, close: 1.5 })),
        getRecentPrices: mock(() => Promise.resolve([]))
      } as unknown as AppVariables['priceRepo'],
      zigzagRepo: {
        savePoints: mock(() => Promise.resolve())
      } as unknown as AppVariables['zigzagRepo'],
      batchRepo: {
        saveAll: mock(() => Promise.resolve(true))
      } as unknown as AppVariables['batchRepo'],
      analyticsService: {
        calculateZigZag: mock(() => Promise.resolve([]))
      } as unknown as AppVariables['analyticsService']
    };

    mockEnv = {
      ANALYTICS_SERVICE_URL: 'http://mock-service'
    };
  });

  describe('getIndicators', () => {
    it('指標リストを取得して 200 を返すこと', async () => {
      const c = createMockContext(mockRepos, mockEnv);
      const res = await MarketController.getIndicators(c) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body.indicators).toEqual(['CPI', '雇用統計']);
    });

    it('例外発生時に 500 と空リストを返すこと', async () => {
      if (mockRepos.sessionRepo) {
        mockRepos.sessionRepo.getRecentEventNames = mock(() => Promise.reject(new Error('DB Error')));
      }
      const c = createMockContext(mockRepos, mockEnv);
      const res = await MarketController.getIndicators(c) as unknown as MockResponse;
      expect(res.status).toBe(500);
      expect(res.body.indicators).toEqual([]);
    });
  });

  describe('getLatestPrice', () => {
    it('最新価格を 200 で返すこと', async () => {
      const c = createMockContext(mockRepos, mockEnv);
      const res = (await MarketController.getLatestPrice(c) as unknown) as { body: { timestamp: string }, status: number };
      expect(res.status).toBe(200);
      expect(res.body.timestamp).toBe('now');
    });
  });

  describe('calculateZigZag', () => {
    it('計算に成功した場合 200 を返すこと', async () => {
      const c = createMockContext(mockRepos, mockEnv);
      const res = await MarketController.calculateZigZag(c) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('ZigZag calculate success');
    });

    it('例外発生時に 500 を返すこと', async () => {
      if (mockRepos.priceRepo) {
        mockRepos.priceRepo.getRecentPrices = mock(() => Promise.reject(new Error('Calculate Error')));
      }
      const c = createMockContext(mockRepos, mockEnv);
      const res = await MarketController.calculateZigZag(c) as unknown as MockResponse;
      expect(res.status).toBe(500);
      expect(res.body.points).toEqual([]);
    });
  });

  describe('getRecentSessions', () => {
    it('データがある場合、セッション一覧を 200 で返すこと', async () => {
      if (mockRepos.sessionRepo) {
        mockRepos.sessionRepo.getThresholds = mock(() => Promise.resolve({
          'NY': { sessionName: 'NY', smallThreshold: 50, largeThreshold: 100 }
        }));
        mockRepos.sessionRepo.findRecentSessions = mock(() => Promise.resolve([
          { sessionName: 'NY', volatilityPoints: 150, condition: 'Small' }
        ]));
      }

      const c = createMockContext(mockRepos, mockEnv, { limit: '5' });
      const res = await MarketController.getRecentSessions(c) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body.sessions).toHaveLength(1);
      const session = res.body.sessions ? (res.body.sessions[0] as { condition: string }) : { condition: '' };
      expect(session.condition).toBe('Large');
      expect(res.body.currentCondition).toBe('Large');
    });

    it('データが空の場合、自動同期を試行すること', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ sessions: [{ condition: 'Mid' }] })
      })) as unknown as typeof globalThis.fetch;

      const c = createMockContext(mockRepos, mockEnv);
      await MarketController.getRecentSessions(c);

      expect(globalThis.fetch).toHaveBeenCalled();
      expect(mockRepos.batchRepo?.saveAll).toHaveBeenCalled();
      
      globalThis.fetch = originalFetch;
    });

    it('自動同期中に fetch が失敗しても安全に続行すること', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(() => Promise.reject(new Error('Fetch Error'))) as unknown as typeof globalThis.fetch;

      const c = createMockContext(mockRepos, mockEnv);
      const res = await MarketController.getRecentSessions(c) as unknown as MockResponse;

      expect(res.status).toBe(200);
      expect(res.body.sessions).toEqual([]);
      
      globalThis.fetch = originalFetch;
    });

    it('例外発生時に 200 で空の結果を返すこと (要件に基づいた挙動)', async () => {
      if (mockRepos.sessionRepo) {
        mockRepos.sessionRepo.findRecentSessions = mock(() => { throw new Error('Error'); });
      }
      const c = createMockContext(mockRepos, mockEnv);
      const res = await MarketController.getRecentSessions(c) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body.sessions).toEqual([]);
    });
  });

  describe('getEventReplay', () => {
    it('eventが指定されていない場合 400 を返すこと', async () => {
      const c = createMockContext(mockRepos, mockEnv, { event: '' });
      const res = await MarketController.getEventReplay(c) as unknown as MockResponse;
      expect(res.status).toBe(400);
    });

    it('正常な指標データ取得で 200 を返すこと', async () => {
      const c = createMockContext(mockRepos, mockEnv, { event: 'CPI' });
      const res = await MarketController.getEventReplay(c) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('candles');
      expect(res.body).toHaveProperty('historicalStats');
    });

    it('例外発生時に 200 で空の構造を返すこと', async () => {
      if (mockRepos.sessionRepo) {
        mockRepos.sessionRepo.findPreviousEvent = mock(() => Promise.reject(new Error('Replay Error')));
      }
      const c = createMockContext(mockRepos, mockEnv, { event: 'CPI' });
      const res = await MarketController.getEventReplay(c) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body.previousEvent).toBeNull();
    });
  });
});
