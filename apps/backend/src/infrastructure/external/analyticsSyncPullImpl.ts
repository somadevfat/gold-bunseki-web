import type { AnalyticsSyncPullPort } from "../../application/port/analyticsSyncPullPort";
import type { SyncPayload } from "../../domain/entities/syncPayload";

/**
 * HttpAnalyticsSyncPull は Analytics サービスの同期エンドポイントへ POST してペイロードを返します。
 */
export class HttpAnalyticsSyncPull implements AnalyticsSyncPullPort {
  async fetchSyncPayload(analyticsBaseUrl: string): Promise<SyncPayload | null> {
    const base = analyticsBaseUrl.replace(/\/+$/, "");
    const response = await fetch(`${base}/analyze/sync`, {
      method: "POST",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as SyncPayload;
  }
}
