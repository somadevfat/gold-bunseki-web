import { expect, describe, it, mock } from 'bun:test';
import { D1BatchRepository } from '../d1BatchRepository';

interface MockD1Database extends D1Database {
  _bindMock: ReturnType<typeof mock>;
  _prepareMock: ReturnType<typeof mock>;
  _batchMock: ReturnType<typeof mock>;
}

describe('D1BatchRepository', () => {

  const createMockD1 = () => {
    const bindMock = mock(() => ({}));
    const prepareMock = mock(() => ({
      bind: bindMock
    }));
    const batchMock = mock(() => Promise.resolve());

    return {
      prepare: prepareMock,
      batch: batchMock,
      _bindMock: bindMock,
      _prepareMock: prepareMock,
      _batchMock: batchMock
    } as unknown as MockD1Database;
  };

  describe('saveAll', () => {
    it('ペイロードが空の場合、何もせず true を返すこと', async () => {
      const mockDb = createMockD1();
      const repo = new D1BatchRepository(mockDb);

      const result = await repo.saveAll({});

      expect(result).toBe(true);
      expect(mockDb._prepareMock).not.toHaveBeenCalled();
      expect(mockDb._batchMock).not.toHaveBeenCalled();
    });

    it('すべての種類のデータが含まれる場合、それぞれの SQL を準備してバッチ実行すること', async () => {
      const mockDb = createMockD1();
      const repo = new D1BatchRepository(mockDb);
      const payload = {
        events: [{ datetimeJst: '2026-04-03 10:00', eventName: 'CPI', importance: 'High', actual: 3.1, forecast: 3.0, previous: 2.9 }],
        sessions: [{ date: '2026-04-03', sessionName: 'NY', startTimeJst: '21:00', endTimeJst: '06:00', volatilityPoints: 100, hasEvent: true, hasHighImpactEvent: false, eventsLinked: 'CPI' }],
        candles: [{ datetimeJst: '2026-04-03 21:00', sessionName: 'NY', openPrice: 100, highPrice: 110, lowPrice: 90, closePrice: 105 }],
        thresholds: [{ sessionName: 'NY', smallThreshold: 70, largeThreshold: 200 }],
        prices: [{ timestamp: '2026-04-03 21:00:00', open: 100, high: 101, low: 99, close: 100.5 }],
        zigzagPoints: [{ timestamp: '2026-04-03 21:00:00', price: 100, type: 'High' }]
      };

      const result = await repo.saveAll(payload);

      expect(result).toBe(true);
      expect(mockDb._prepareMock).toHaveBeenCalledTimes(6);
      expect(mockDb._bindMock).toHaveBeenCalledTimes(6);
      expect(mockDb._batchMock).toHaveBeenCalled();
    });

    it('100件を超えるデータがある場合、100件ずつ分割してバッチ実行すること', async () => {
      const mockDb = createMockD1();
      const repo = new D1BatchRepository(mockDb);
      
      // 150件の価格データを生成
      const prices = Array.from({ length: 150 }, (_, i) => ({
        timestamp: `2026-04-03 00:00:${i.toString().padStart(2, '0')}`,
        open: 100, high: 101, low: 99, close: 100
      }));

      const result = await repo.saveAll({ prices });

      expect(result).toBe(true);
      expect(mockDb._batchMock).toHaveBeenCalledTimes(2); // 100件 + 50件
    });

    it('boolean値が 正しく 1/0 に変換されて bind されること', async () => {
       const mockDb = createMockD1();
       const repo = new D1BatchRepository(mockDb);
       const sessions = [{ 
         date: '2026-04-03', sessionName: 'NY', startTimeJst: '21:00', endTimeJst: '06:00', 
         volatilityPoints: 100, hasEvent: true, hasHighImpactEvent: false, eventsLinked: '' 
       }];

       await repo.saveAll({ sessions });

       // bind の引数を確認 (hasEvent=1, hasHighImpactEvent=0)
       expect(mockDb._bindMock).toHaveBeenCalledWith(
         '2026-04-03', 'NY', '21:00', '06:00', 100, 1, 0, ''
       );
    });
  });
});
