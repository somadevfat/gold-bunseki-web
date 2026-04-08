import { describe, it, expect, mock } from 'bun:test';
import { DrizzleBatchRepository, SyncPayload } from '../drizzleBatchRepository';
import { createMockDrizzle } from '../../../interface/test/testHelpers';

/**
 * DrizzleBatchRepository Unit Tests
 * @responsibility: Drizzle ORM のトランザクション機能を利用して、各テーブルへの一括 Upsert が正しく呼び出されることを検証する。
 */
describe('DrizzleBatchRepository', () => {
  describe('saveAll', () => {
    it('全データ（イベント、セッション、ローソク足など）が含まれる場合に、それぞれの insert が呼び出されること', async () => {
      const payload: SyncPayload = {
        events: [
          { datetimeJst: '2026-03-27 21:30:00', eventName: 'CPI', importance: 'High', actual: 3.2, forecast: 3.1, previous: 3.0 }
        ],
        sessions: [
          { date: '2026-03-27', sessionName: 'NY', startTimeJst: '21:00', endTimeJst: '06:00', volatilityPoints: 150.5, hasEvent: true, hasHighImpactEvent: true, eventsLinked: 'CPI' }
        ],
        candles: [
          { datetimeJst: '2026-03-27 21:30:00', sessionName: 'NY', openPrice: 2300.0, highPrice: 2310.0, lowPrice: 2295.0, closePrice: 2305.0 }
        ],
        thresholds: [
          { sessionName: 'NY', smallThreshold: 80, largeThreshold: 150 }
        ],
        prices: [
          { timestamp: '2026-03-27T12:30:00Z', open: 2300, high: 2301, low: 2299, close: 2300 }
        ],
        zigzagPoints: [
          { timestamp: '2026-03-27T12:30:00Z', price: 2300, type: 'High' }
        ]
      };

      const mockDb = createMockDrizzle([]);
      const repo = new DrizzleBatchRepository(mockDb);

      const result = await repo.saveAll(payload);

      expect(result).toBe(true);
      expect(mockDb.transaction).toHaveBeenCalled();
      // トランザクション内で各メソッドが呼ばれることを確認
      expect(mockDb.insert).toHaveBeenCalledTimes(6);
      expect(mockDb.onConflictDoNothing).toHaveBeenCalledTimes(3); // events, candles, prices
      expect(mockDb.onConflictDoUpdate).toHaveBeenCalledTimes(3); // sessions, thresholds, zigzag
    });

    it('一部のデータが空の場合、そのテーブルへの insert はスキップされること', async () => {
      const payload: SyncPayload = {
        events: [],
        sessions: [
          { date: '2026-03-27', sessionName: 'NY', startTimeJst: '21:00', endTimeJst: '06:00', volatilityPoints: 150.5, hasEvent: true, hasHighImpactEvent: true, eventsLinked: 'CPI' }
        ]
      };

      const mockDb = createMockDrizzle([]);
      const repo = new DrizzleBatchRepository(mockDb);

      const result = await repo.saveAll(payload);

      expect(result).toBe(true);
      expect(mockDb.insert).toHaveBeenCalledTimes(1); // sessions のみ
    });

    it('エラーが発生した場合に false を返し、エラーログを出力すること', async () => {
      const payload: SyncPayload = {
        prices: [{ timestamp: '2026-03-27T12:30:00Z', open: 2300, high: 2301, low: 2299, close: 2300 }]
      };

      const mockDb = createMockDrizzle([]);
      // transaction を失敗させる
      mockDb.transaction = mock(async () => { throw new Error('DB Error'); });

      const repo = new DrizzleBatchRepository(mockDb);
      
      const result = await repo.saveAll(payload);

      expect(result).toBe(false);
    });
  });
});
