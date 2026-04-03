import { expect, describe, it } from 'bun:test';
import { D1PriceRepository } from '../d1PriceRepository';
import { createMockD1 } from '../../../interface/test/testHelpers';

/**
 * D1PriceRepository Unit Tests
 * @responsibility: D1 に対して SQL が正しく発行され、結果がドメインモデルに変換されることを検証する。
 */
describe('D1PriceRepository', () => {

  describe('getLatestPrice', () => {
    it('データが存在する場合、最新の価格レコードを1件返すこと', async () => {
      // ## Arrange ##
      const mockData = {
        timestamp: '2026-04-03T12:00:00Z',
        open: 2000.5,
        high: 2010.0,
        low: 1995.5,
        close: 2005.0
      };
      const mockDb = createMockD1([], mockData);
      const repo = new D1PriceRepository(mockDb);

      // ## Act ##
      const result = await repo.getLatestPrice();

      // ## Assert ##
      expect(result).toEqual(mockData);
    });

    it('データが存在しない場合、null を返すこと', async () => {
      // ## Arrange ##
      const mockDb = createMockD1([], null);
      const repo = new D1PriceRepository(mockDb);

      // ## Act ##
      const result = await repo.getLatestPrice();

      // ## Assert ##
      expect(result).toBeNull();
    });
  });

  describe('getRecentPrices', () => {
    it('指定された件数の価格レコードを配列で返すこと', async () => {
      // ## Arrange ##
      const mockResults = [
        { timestamp: '2026-04-03T12:00:00Z', open: 2000, high: 2010, low: 1990, close: 2005 },
        { timestamp: '2026-04-03T11:59:00Z', open: 1995, high: 2005, low: 1985, close: 2000 }
      ];
      const mockDb = createMockD1(mockResults);
      const repo = new D1PriceRepository(mockDb);

      // ## Act ##
      const result = await repo.getRecentPrices(2);

      // ## Assert ##
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockResults);
    });

    it('データがない場合、空配列を返すこと', async () => {
      // ## Arrange ##
      const mockDb = createMockD1([]);
      const repo = new D1PriceRepository(mockDb);

      // ## Act ##
      const result = await repo.getRecentPrices(5);

      // ## Assert ##
      expect(result).toEqual([]);
    });
  });
});
