import { expect, describe, it, mock, beforeEach } from 'bun:test';
import { SyncController } from '../syncController';
import { createMockContext } from '../../test/testHelpers';
import { AppVariables, Bindings } from '../../types';

interface MockResponse {
  body: { success: boolean, message: string, syncHealth?: string };
  status: number;
}

describe('SyncController', () => {

  let mockRepos: Partial<AppVariables>;
  let mockEnv: Partial<Bindings>;

  beforeEach(() => {
    mockRepos = {
      syncRepo: {
        getSyncStatus: mock(() => Promise.resolve({ 
          lastCandleAt: 'now', 
          lastSessionAt: 'now', 
          lastEventAt: 'now', 
          totalCandles: 100, 
          syncHealth: 'Healthy' 
        }))
      } as unknown as AppVariables['syncRepo'],
      batchRepo: {
        saveAll: mock(() => Promise.resolve(true))
      } as unknown as AppVariables['batchRepo']
    };

    mockEnv = {
      ANALYTICS_SERVICE_URL: 'http://mock-service'
    };
  });

  describe('getSyncStatus', () => {
    it('同期ステータスを取得して 200 で返すこと', async () => {
      const c = createMockContext(mockRepos, mockEnv);
      const res = await SyncController.getSyncStatus(c) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body.syncHealth).toBe('Healthy');
    });
  });

  describe('triggerSync', () => {
    it('Pull同期に成功した場合 200 を返すこと', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ sessions: [] })
      })) as unknown as typeof globalThis.fetch;

      const c = createMockContext(mockRepos, mockEnv);
      const res = await SyncController.triggerSync(c) as unknown as MockResponse;
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockRepos.batchRepo?.saveAll).toHaveBeenCalled();

      globalThis.fetch = originalFetch;
    });

    it('Analyticsエンジンがエラーを返した場合 500 を返すこと', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(() => Promise.resolve({
        ok: false,
        status: 500
      })) as unknown as typeof globalThis.fetch;

      const c = createMockContext(mockRepos, mockEnv);
      const res = await SyncController.triggerSync(c) as unknown as MockResponse;
      
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);

      globalThis.fetch = originalFetch;
    });

    it('例外発生時に 500 を返すこと', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(() => Promise.reject(new Error('Network Error'))) as unknown as typeof globalThis.fetch;

      const c = createMockContext(mockRepos, mockEnv);
      const res = await SyncController.triggerSync(c) as unknown as MockResponse;
      
      expect(res.status).toBe(500);
      expect(res.body.message).toContain('Network Error');

      globalThis.fetch = originalFetch;
    });
  });

  describe('receiveSyncData', () => {
    it('Push同期に成功した場合 200 を返すこと', async () => {
      const c = createMockContext(mockRepos, mockEnv);
      const res = await SyncController.receiveSyncData(c) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockRepos.batchRepo?.saveAll).toHaveBeenCalled();
    });

    it('例外発生時に 500 を返すこと', async () => {
      if (mockRepos.batchRepo) {
        mockRepos.batchRepo.saveAll = mock(() => Promise.reject(new Error('Save Error')));
      }
      const c = createMockContext(mockRepos, mockEnv);
      const res = await SyncController.receiveSyncData(c) as unknown as MockResponse;
      expect(res.status).toBe(500);
      expect(res.body.message).toContain('Save Error');
    });
  });
});
