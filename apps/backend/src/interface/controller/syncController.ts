import { Context } from "hono";
import { Bindings, AppVariables } from "../types";
import { GetSyncStatusUseCase } from "../../application/use_case/getSyncStatusUseCase";
import { SyncPayload } from "../../infrastructure/repository/drizzleBatchRepository";

/**
 * SyncController はデータの同期ステータス確認および同期実行リクエストを処理します。
 */
export class SyncController {
  /* c8 ignore next */
  constructor() {}

  /**
   * 同期ステータスの取得
   */
  static async getSyncStatus(
    c: Context<{ Bindings: Bindings; Variables: AppVariables }>,
  ) {
    const useCase = new GetSyncStatusUseCase(c.get("syncRepo"));
    const status = await useCase.execute();
    return c.json(status, 200);
  }

  /**
   * 同期データ受取 (Push型) - 常用
   */
  static async receiveSyncData(
    c: Context<{ Bindings: Bindings; Variables: AppVariables }>,
  ) {
    try {
      const payload = (await c.req.valid("json" as never)) as SyncPayload;
      console.log("[Sync:Push] Received direct data push (Incremental)...");
      await c.get("batchRepo").saveAll(payload);

      return c.json({ success: true, message: "差分同期成功 (Push)" }, 200);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("[Sync:Push Error]", error.message);
      return c.json(
        { success: false, message: `差分Push同期失敗: ${error.message}` },
        500,
      );
    }
  }

  /**
   * シードデータ受取 (Push型) - 初回大量データ用
   */
  static async receiveSeedData(
    c: Context<{ Bindings: Bindings; Variables: AppVariables }>,
  ) {
    try {
      const payload = (await c.req.valid("json" as never)) as SyncPayload;
      console.log("[Sync:Seed] Received massive seed data push...");
      await c.get("batchRepo").saveAll(payload);

      return c.json({ success: true, message: "シードデータ保存成功" }, 200);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("[Sync:Seed Error]", error.message);
      return c.json(
        { success: false, message: `シードデータ保存失敗: ${error.message}` },
        500,
      );
    }
  }
}
