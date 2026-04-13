import { describe, it, expect } from "bun:test";
import { DrizzleSyncRepository } from "../drizzleSyncRepository";
import { createMockDrizzle } from "../../../interface/test/testHelpers";

/**
 * DrizzleSyncRepository Unit Tests
 * @responsibility: 各テーブルの最新タイムスタンプを集計して、同期ステータスが正しく算出されることを検証する。
 */
describe("DrizzleSyncRepository", () => {
  describe("getSyncStatus", () => {
    it("DBの統計データから同期ステータスが正しく構築されること", async () => {
      // 3回の select 呼び出しに対してそれぞれ結果を返す必要がある
      // モックの実装を調整して、順次異なる結果を返せるようにする
      const mockDb = createMockDrizzle([]);

      let callCount = 0;
      mockDb.then = (resolve: (val: unknown[]) => void) => {
        callCount++;
        if (callCount === 1)
          resolve([{ lastCandle: "2026-03-27 16:00:00", totalCandles: 1000 }]);
        if (callCount === 2) resolve([{ lastSession: "2026-03-27" }]);
        if (callCount === 3) resolve([{ lastEvent: "2026-03-27 21:30:00" }]);
        return resolve([]);
      };

      const repo = new DrizzleSyncRepository(mockDb);
      const status = await repo.getSyncStatus();

      expect(status.lastCandleAt).toBe("2026-03-27 16:00:00");
      expect(status.lastSessionAt).toBe("2026-03-27");
      expect(status.lastEventAt).toBe("2026-03-27 21:30:00");
      expect(status.totalCandles).toBe(1000);
    });

    it("データが空の場合にデフォルト値が返されること", async () => {
      const mockDb = createMockDrizzle([]); // 全て空配列を返す
      const repo = new DrizzleSyncRepository(mockDb);
      const status = await repo.getSyncStatus();

      expect(status.lastCandleAt).toBe("1970-01-01 00:00:00");
      expect(status.totalCandles).toBe(0);
      expect(status.syncHealth).toBe("Stale");
    });
  });
});
