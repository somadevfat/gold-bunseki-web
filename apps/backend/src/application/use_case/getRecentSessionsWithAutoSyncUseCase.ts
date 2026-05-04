import type { AnalyticsSyncPullPort } from "../port/analyticsSyncPullPort";
import type { BatchRepositoryPort } from "../port/batchRepositoryPort";
import { SessionVolatility } from "../../domain/entities/session";
import { GetRecentSessionsUseCase } from "./getRecentSessionsUseCase";

/**
 * GetRecentSessionsWithAutoSyncUseCase は一覧が空のとき Analytics の同期エンドポイントからデータをプルし保存してから一覧を組み立てます。
 * @responsibility 自動同期トリガ・永続化・セッション再取得をインフェース層から隠蔽する。
 */
export class GetRecentSessionsWithAutoSyncUseCase {
  constructor(
    private readonly getRecentSessions: GetRecentSessionsUseCase,
    private readonly batchRepo: BatchRepositoryPort,
    private readonly analyticsSyncPull: AnalyticsSyncPullPort,
  ) {}

  /**
   * @param analyticsBaseUrl 末尾スラッシュ有無によらず `.../analyze/sync` へ結合される想定。
   */
  async execute(
    limit: number,
    analyticsBaseUrl: string,
  ): Promise<SessionVolatility[]> {
    const sessions = await this.getRecentSessions.execute(limit);
    if (sessions.length > 0) return sessions;

    console.log(
      "[Auto-Sync] Database is empty. Triggering automatic sync...",
    );

    try {
      const payload =
        await this.analyticsSyncPull.fetchSyncPayload(analyticsBaseUrl);
      if (!payload) {
        return [];
      }

      await this.batchRepo.saveAll(payload);
      return await this.getRecentSessions.execute(limit);
    } catch (syncErr: unknown) {
      const error =
        syncErr instanceof Error ? syncErr : new Error(String(syncErr));
      console.warn("[Auto-Sync Failed]", error.message);
      return [];
    }
  }
}
