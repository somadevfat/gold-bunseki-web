import { expect, describe, it } from 'bun:test';
import { D1SessionRepository } from '../d1SessionRepository';
import { createMockD1 } from '../../../interface/test/testHelpers';

describe('D1SessionRepository', () => {

  describe('findRecentSessions', () => {
    it('直近のセッション一覧を取得し、ドメインモデルに変換すること', async () => {
      const mockResults = [
        {
          id: 1, date: '2026-04-03', session_name: 'NY', start_time_jst: '21:00', end_time_jst: '06:00',
          volatility_points: 150, has_event: 1, has_high_impact_event: 0, events_linked: 'CPI'
        }
      ];
      const mockDb = createMockD1(mockResults);
      const repo = new D1SessionRepository(mockDb);

      const result = await repo.findRecentSessions(1);

      expect(result).toHaveLength(1);
      expect(result[0].sessionName).toBe('NY');
      expect(result[0].hasEvent).toBe(true);
      expect(result[0].hasHighImpactEvent).toBe(false);
    });
  });

  describe('findPreviousEvent', () => {
    it('指標名に一致する過去のセッションを返すこと', async () => {
      // 過去の日付（今日ではない）
      const mockResults = [
        {
          id: 10, date: '2026-03-01', session_name: 'NY', start_time_jst: '21:00', end_time_jst: '06:00',
          volatility_points: 200, has_event: 1, has_high_impact_event: 1, events_linked: '雇用統計',
          exact_event_time: '2026-03-01 21:30:00'
        }
      ];
      const mockDb = createMockD1(mockResults);
      const repo = new D1SessionRepository(mockDb);

      const result = await repo.findPreviousEvent('雇用統計');

      expect(result).not.toBeNull();
      expect(result?.date).toBe('2026-03-01');
      expect(result?.exactEventTimeJst).toBe('2026-03-01 21:30:00');
    });

    it('今日の日付のデータしかない場合は、過去データがないとして null を返すこと', async () => {
      const nowJST = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
      const mockResults = [
        {
          id: 20, date: nowJST, session_name: 'NY', start_time_jst: '21:00', end_time_jst: '06:00',
          volatility_points: 100, has_event: 1, has_high_impact_event: 0, events_linked: '雇用統計',
          exact_event_time: null
        }
      ];
      const mockDb = createMockD1(mockResults);
      const repo = new D1SessionRepository(mockDb);

      const result = await repo.findPreviousEvent('雇用統計');

      expect(result).toBeNull();
    });

    it('今日と過去の両方がある場合、過去のデータを返すこと', async () => {
      const nowJST = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
      const mockResults = [
        { id: 21, date: nowJST, session_name: 'NY', volatility_points: 100, events_linked: '雇用統計' },
        { id: 20, date: '2026-03-01', session_name: 'NY', volatility_points: 200, events_linked: '雇用統計' }
      ];
      const mockDb = createMockD1(mockResults);
      const repo = new D1SessionRepository(mockDb);

      const result = await repo.findPreviousEvent('雇用統計');

      expect(result?.id).toBe(20);
    });

    it('データが全くない場合は null を返すこと', async () => {
      const mockDb = createMockD1([]);
      const repo = new D1SessionRepository(mockDb);
      const result = await repo.findPreviousEvent('None');
      expect(result).toBeNull();
    });
  });

  describe('getCandles', () => {
    it('特定の日付とセッションのキャンドルデータを返すこと', async () => {
      const mockCandles = [{ datetimeJst: '2026-04-03 21:00', open: 100, high: 110, low: 90, close: 105 }];
      const mockDb = createMockD1(mockCandles);
      const repo = new D1SessionRepository(mockDb);

      const result = await repo.getCandles('2026-04-03', 'NY');

      expect(result).toEqual(mockCandles);
    });
  });

  describe('getThresholds', () => {
    it('閾値設定をマップ形式で返すこと', async () => {
      const mockResults = [
        { session_name: 'London', small_threshold: 50, large_threshold: 150 },
        { session_name: 'NY', small_threshold: 70, large_threshold: 200 }
      ];
      const mockDb = createMockD1(mockResults);
      const repo = new D1SessionRepository(mockDb);

      const result = await repo.getThresholds();

      expect(result['London'].smallThreshold).toBe(50);
      expect(result['NY'].largeThreshold).toBe(200);
    });
  });

  describe('getEventStats', () => {
    it('指標別の平均ボラティリティを地合い別に算出すること', async () => {
      const mockResults = [
        { session_name: 'NY', volatility_points: 300 }, // Large
        { session_name: 'NY', volatility_points: 100 }, // Mid
        { session_name: 'NY', volatility_points: 50 }   // Small
      ];
      const thresholds = {
        'NY': { sessionName: 'NY', smallThreshold: 70, largeThreshold: 200 }
      };
      const mockDb = createMockD1(mockResults);
      const repo = new D1SessionRepository(mockDb);

      const stats = await repo.getEventStats('雇用統計', thresholds);

      const large = stats.find(s => s.condition === 'Large');
      const mid = stats.find(s => s.condition === 'Mid');
      const small = stats.find(s => s.condition === 'Small');

      expect(large?.averageVola).toBe(300);
      expect(mid?.averageVola).toBe(100);
      expect(small?.averageVola).toBe(50);
    });

    it('閾値がない場合でもデフォルトで Small として計算されること', async () => {
       const mockResults = [{ session_name: 'Unknown', volatility_points: 300 }];
       const mockDb = createMockD1(mockResults);
       const repo = new D1SessionRepository(mockDb);

       const stats = await repo.getEventStats('Test', {});
       const small = stats.find(s => s.condition === 'Small');
       expect(small?.count).toBe(1);
       expect(small?.averageVola).toBe(300);
    });
  });

  describe('getRecentEventNames', () => {
    it('ユニークな指標名リストを返すこと', async () => {
      const mockResults = [{ event_name: 'CPI' }, { event_name: '雇用統計' }];
      const mockDb = createMockD1(mockResults);
      const repo = new D1SessionRepository(mockDb);

      const result = await repo.getRecentEventNames(5);

      expect(result).toEqual(['CPI', '雇用統計']);
    });
  });
});
