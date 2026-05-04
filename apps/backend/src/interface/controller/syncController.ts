import { Context } from "hono";
import { Bindings, AppVariables } from "../types";
import { SyncPayload } from "../../infrastructure/repository/drizzleBatchRepository";
import { AppContainer } from "../../app/container";

/**
 * createSyncController はデータの同期ステータス確認および同期実行リクエストを処理するハンドラを作成します。
 * @responsibility Sync API の HTTP リクエストを AppContainer 上の依存へ橋渡しする。
 */
export function createSyncController(container: AppContainer) {
  return {
    /**
     * 同期ステータスの取得
     */
    getSyncStatus: async (c: Context<{ Bindings: Bindings; Variables: AppVariables }>) => {
      const status = await container.useCases.sync.getStatus.execute();
      return c.json(status, 200);
    },

    /**
     * 同期データ受取 (Push型) - 常用
     */
    receiveSyncData: async (c: Context<{ Bindings: Bindings; Variables: AppVariables }>) => {
      try {
        const payload = (await c.req.valid("json" as never)) as SyncPayload;
        await container.repositories.batchRepo.saveAll(payload);

        return c.json({ success: true, message: "差分同期成功 (Push)" }, 200);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        return c.json(
          { success: false, message: `差分Push同期失敗: ${error.message}` },
          500,
        );
      }
    },

    /**
     * シードデータ受取 (Push型) - 初回大量データ用
     */
    receiveSeedData: async (c: Context<{ Bindings: Bindings; Variables: AppVariables }>) => {
      try {
        const payload = (await c.req.valid("json" as never)) as SyncPayload;
        await container.repositories.batchRepo.saveAll(payload);

        return c.json({ success: true, message: "シードデータ保存成功" }, 200);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        return c.json(
          { success: false, message: `シードデータ保存失敗: ${error.message}` },
          500,
        );
      }
    },
  };
}
