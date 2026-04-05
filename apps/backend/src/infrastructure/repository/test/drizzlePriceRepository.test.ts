import { describe, it, expect } from 'bun:test';
import { DrizzlePriceRepository } from '../drizzlePriceRepository';
import { createMockDrizzle } from '../../../interface/test/testHelpers';

/**
 * DrizzlePriceRepository Unit Tests
 * @responsibility: Drizzle ORM を通じて PostgreSQL に対して SQL が正しく発行され、結果がドメインモデルに変換されることを検証する。
 */
describe('DrizzlePriceRepository', () => {
  describe('getLatestPrice', () => {
    it('最新の価格が1件取得できること', async () => {
      const mockData = {
        timestamp: '2026-03-27T16:00:00Z',
        open: 2300.0,
        high: 2305.5,
        low: 2298.2,
        close: 2302.1,
      };

      const mockDb = createMockDrizzle([mockData]);
      const repo = new DrizzlePriceRepository(mockDb);

      const result = await repo.getLatestPrice();

      expect(result).toEqual(mockData);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(1);
    });

    it('データがない場合に null を返すこと', async () => {
      const mockDb = createMockDrizzle([]);
      const repo = new DrizzlePriceRepository(mockDb);

      const result = await repo.getLatestPrice();

      expect(result).toBeNull();
    });
  });

  describe('getRecentPrices', () => {
    it('指定した件数の価格履歴が取得できること', async () => {
      const mockResults = [
        { timestamp: '2026-03-27T16:01:00Z', open: 2302.1, high: 2303.0, low: 2301.5, close: 2302.5 },
        { timestamp: '2026-03-27T16:00:00Z', open: 2300.0, high: 2305.5, low: 2298.2, close: 2302.1 },
      ];

      const mockDb = createMockDrizzle(mockResults);
      const repo = new DrizzlePriceRepository(mockDb);

      const result = await repo.getRecentPrices(2);

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockResults);
      expect(mockDb.limit).toHaveBeenCalledWith(2);
    });

    it('空の場合は空配列を返すこと', async () => {
      const mockDb = createMockDrizzle([]);
      const repo = new DrizzlePriceRepository(mockDb);

      const result = await repo.getRecentPrices(10);

      expect(result).toEqual([]);
    });
  });
});
