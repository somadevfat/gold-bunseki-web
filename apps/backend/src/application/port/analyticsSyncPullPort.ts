import type { SyncPayload } from "../../domain/entities/syncPayload";

/**
 * AnalyticsSyncPullPort は Analytics エンジンからバッチ保存向けペイロードを取得する契約です。
 */
export interface AnalyticsSyncPullPort {
  fetchSyncPayload(analyticsBaseUrl: string): Promise<SyncPayload | null>;
}
