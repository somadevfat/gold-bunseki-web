import { expect, describe, it, mock, beforeEach } from "bun:test";
import { createSyncController } from "../syncController";
import { createMockContext } from "../../test/testHelpers";
import { Bindings } from "../../types";
import { AppContainer } from "../../../app/container";

interface MockResponse {
  body: { success: boolean; message: string; syncHealth?: string };
  status: number;
}

describe("SyncController", () => {
  let container: AppContainer;
  let getStatusExecute: ReturnType<typeof mock>;
  let saveAll: ReturnType<typeof mock>;
  let mockEnv: Partial<Bindings>;

  beforeEach(() => {
    getStatusExecute = mock(() =>
      Promise.resolve({
        lastCandleAt: "now",
        lastSessionAt: "now",
        lastEventAt: "now",
        totalCandles: 100,
        syncHealth: "Healthy",
      }),
    );
    saveAll = mock(() => Promise.resolve(true));
    container = {
      repositories: {
        batchRepo: { saveAll },
      },
      useCases: {
        sync: {
          getStatus: { execute: getStatusExecute },
        },
      },
    } as unknown as AppContainer;

    mockEnv = {
      ANALYTICS_SERVICE_URL: "http://mock-service",
    };
  });

  describe("getSyncStatus", () => {
    it("同期ステータスを取得して 200 で返すこと", async () => {
      const controller = createSyncController(container);
      const c = createMockContext({}, mockEnv);
      const res = (await controller.getSyncStatus(c)) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body.syncHealth).toBe("Healthy");
      expect(getStatusExecute).toHaveBeenCalledTimes(1);
    });
  });

  describe("receiveSeedData", () => {
    it("シードデータ保存に成功した場合 200 を返すこと", async () => {
      const controller = createSyncController(container);
      const c = createMockContext({}, mockEnv);
      const res = (await controller.receiveSeedData(c)) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(saveAll).toHaveBeenCalled();
    });

    it("例外発生時に既存API契約のエラーレスポンスを返すこと", async () => {
      saveAll = mock(() => Promise.reject(new Error("Seed Error")));
      container.repositories.batchRepo.saveAll = saveAll;
      const controller = createSyncController(container);
      const c = createMockContext({}, mockEnv);

      const res = (await controller.receiveSeedData(c)) as unknown as MockResponse;
      expect(res.status).toBe(500);
      expect(res.body.message).toContain("Seed Error");
    });
  });

  describe("receiveSyncData", () => {
    it("Push同期に成功した場合 200 を返すこと", async () => {
      const controller = createSyncController(container);
      const c = createMockContext({}, mockEnv);
      const res = (await controller.receiveSyncData(c)) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(saveAll).toHaveBeenCalled();
    });

    it("例外発生時に既存API契約のエラーレスポンスを返すこと", async () => {
      saveAll = mock(() => Promise.reject(new Error("Save Error")));
      container.repositories.batchRepo.saveAll = saveAll;
      const controller = createSyncController(container);
      const c = createMockContext({}, mockEnv);

      const res = (await controller.receiveSyncData(c)) as unknown as MockResponse;
      expect(res.status).toBe(500);
      expect(res.body.message).toContain("Save Error");
    });
  });
});
