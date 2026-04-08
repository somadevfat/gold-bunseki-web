import { describe, it, expect } from 'bun:test';
import { DrizzleZigZagRepository } from '../drizzleZigZagRepository';
import { createMockDrizzle } from '../../../interface/test/testHelpers';
import { ZigZagPoint } from '../../../domain/entities/zigzag';

/**
 * DrizzleZigZagRepository Unit Tests
 * @responsibility: Drizzle ORM を通じて PostgreSQL に対して SQL が正しく発行され、データが保存されることを検証する。
 */
describe('DrizzleZigZagRepository', () => {
  describe('savePoints', () => {
    it('複数の転換点が正常に保存されること', async () => {
      const mockPoints: ZigZagPoint[] = [
        { timestamp: '2026-03-27T16:00:00Z', price: 2300.0, type: 'high' },
        { timestamp: '2026-03-27T16:05:00Z', price: 2290.0, type: 'low' },
      ];

      const mockDb = createMockDrizzle([]);
      const repo = new DrizzleZigZagRepository(mockDb);

      await repo.savePoints(mockPoints);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(mockPoints);
      expect(mockDb.onConflictDoNothing).toHaveBeenCalled();
    });

    it('空配列が渡された場合に何もしないこと', async () => {
      const mockDb = createMockDrizzle([]);
      const repo = new DrizzleZigZagRepository(mockDb);

      await repo.savePoints([]);

      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });
});
