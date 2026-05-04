import type { SyncPayload } from "../../domain/entities/syncPayload";

/**
 * BatchRepositoryPort は解析エンジン由来のインバウンドデータを一括保存する契約です。
 */
export interface BatchRepositoryPort {
  saveAll(payload: SyncPayload): Promise<boolean>;
}
