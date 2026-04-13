import { expect, describe, it, mock, beforeEach } from "bun:test";
import { SyncController } from "../syncController";
import { createMockContext } from "../../test/testHelpers";
import { AppVariables, Bindings } from "../../types";

interface MockResponse {
  body: { success: boolean; message: string; syncHealth?: string };
  status: number;
}

describe("SyncController", () => {
  it("クラスをインスタンス化できること", () => {
    expect(new SyncController()).toBeInstanceOf(SyncController);
  });
  let mockRepos: Partial<AppVariables>;
  let mockEnv: Partial<Bindings>;

  beforeEach(() => {
    mockRepos = {
      syncRepo: {
        getSyncStatus: mock(() =>
          Promise.resolve({
            lastCandleAt: "now",
            lastSessionAt: "now",
            lastEventAt: "now",
            totalCandles: 100,
            syncHealth: "Healthy",
          }),
        ),
      } as unknown as AppVariables["syncRepo"],
      batchRepo: {
        saveAll: mock(() => Promise.resolve(true)),
      } as unknown as AppVariables["batchRepo"],
    };

    mockEnv = {
      ANALYTICS_SERVICE_URL: "http://mock-service",
    };
  });

  describe("getSyncStatus", () => {
    it("同期ステータスを取得して 200 で返すこと", async () => {
      const c = createMockContext(mockRepos, mockEnv);
      const res = (await SyncController.getSyncStatus(
        c,
      )) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body.syncHealth).toBe("Healthy");
    });
  });

  describe("receiveSeedData", () => {
    it("シードデータ保存に成功した場合 200 を返すこと", async () => {
      const c = createMockContext(mockRepos, mockEnv);
      const res = (await SyncController.receiveSeedData(
        c,
      )) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockRepos.batchRepo?.saveAll).toHaveBeenCalled();
    });

    it("例外発生時に 500 を返すこと", async () => {
      if (mockRepos.batchRepo) {
        mockRepos.batchRepo.saveAll = mock(() =>
          Promise.reject(new Error("Seed Error")),
        );
      }
      const c = createMockContext(mockRepos, mockEnv);
      const res = (await SyncController.receiveSeedData(
        c,
      )) as unknown as MockResponse;
      expect(res.status).toBe(500);
      expect(res.body.message).toContain("Seed Error");
    });
  });

  describe("receiveSyncData", () => {
    it("Push同期に成功した場合 200 を返すこと", async () => {
      const c = createMockContext(mockRepos, mockEnv);
      const res = (await SyncController.receiveSyncData(
        c,
      )) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockRepos.batchRepo?.saveAll).toHaveBeenCalled();
    });

    it("例外発生時に 500 を返すこと", async () => {
      if (mockRepos.batchRepo) {
        mockRepos.batchRepo.saveAll = mock(() =>
          Promise.reject(new Error("Save Error")),
        );
      }
      const c = createMockContext(mockRepos, mockEnv);
      const res = (await SyncController.receiveSyncData(
        c,
      )) as unknown as MockResponse;
      expect(res.status).toBe(500);
      expect(res.body.message).toContain("Save Error");
    });
  });
});
