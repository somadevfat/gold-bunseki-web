import { CalculateZigZagUseCase } from "../application/use_case/calculateZigZagUseCase";
import { CreateCommunityThreadUseCase } from "../application/use_case/createCommunityThreadUseCase";
import { GetCommunityThreadsUseCase } from "../application/use_case/getCommunityThreadsUseCase";
import { GetLatestPriceUseCase } from "../application/use_case/getLatestPriceUseCase";
import { GetRecentEventNamesUseCase } from "../application/use_case/getRecentEventNamesUseCase";
import { GetRecentSessionsUseCase } from "../application/use_case/getRecentSessionsUseCase";
import { GetReplayDataUseCase } from "../application/use_case/getReplayDataUseCase";
import { GetSyncStatusUseCase } from "../application/use_case/getSyncStatusUseCase";
import { db, DbType } from "../infrastructure/database/db";
import { HttpAnalyticsService } from "../infrastructure/external/analyticsServiceImpl";
import { DrizzleBatchRepository } from "../infrastructure/repository/drizzleBatchRepository";
import { DrizzleCommunityThreadRepository } from "../infrastructure/repository/drizzleCommunityThreadRepository";
import { DrizzlePriceRepository } from "../infrastructure/repository/drizzlePriceRepository";
import { DrizzleSessionRepository } from "../infrastructure/repository/drizzleSessionRepository";
import { DrizzleSyncRepository } from "../infrastructure/repository/drizzleSyncRepository";
import { DrizzleZigZagRepository } from "../infrastructure/repository/drizzleZigZagRepository";

export type CreateAppContainerOptions = {
  /** テスト用。省略時は `process.env.ANALYTICS_SERVICE_URL` → `http://127.0.0.1:8000`。 */
  analyticsBaseUrl?: string;
};

/**
 * createAppContainer はアプリケーション全体の依存関係を生成して配線します。
 * @responsibility Repository / UseCase のインスタンス生成を一箇所に集約する。
 */
export function createAppContainer(
  database: DbType = db,
  options: CreateAppContainerOptions = {},
) {
  const communityThreadRepo = new DrizzleCommunityThreadRepository(database);
  const syncRepo = new DrizzleSyncRepository(database);
  const batchRepo = new DrizzleBatchRepository(database);
  const priceRepo = new DrizzlePriceRepository(database);
  const zigzagRepo = new DrizzleZigZagRepository(database);
  const sessionRepo = new DrizzleSessionRepository(database);

  const analyticsBaseUrl =
    options.analyticsBaseUrl ??
    process.env.ANALYTICS_SERVICE_URL ??
    "http://127.0.0.1:8000";
  const analyticsService = new HttpAnalyticsService(analyticsBaseUrl);

  return {
    repositories: {
      priceRepo,
      zigzagRepo,
      sessionRepo,
      syncRepo,
      batchRepo,
      communityThreadRepo,
    },
    useCases: {
      community: {
        getThreads: new GetCommunityThreadsUseCase(communityThreadRepo),
        createThread: new CreateCommunityThreadUseCase(communityThreadRepo),
      },
      sync: {
        getStatus: new GetSyncStatusUseCase(syncRepo),
      },
      market: {
        getLatestPrice: new GetLatestPriceUseCase(priceRepo),
        calculateZigZag: new CalculateZigZagUseCase(
          priceRepo,
          analyticsService,
          zigzagRepo,
        ),
        getRecentSessions: new GetRecentSessionsUseCase(sessionRepo),
        getReplayData: new GetReplayDataUseCase(sessionRepo),
        getIndicators: new GetRecentEventNamesUseCase(sessionRepo),
      },
    },
  };
}

export type AppContainer = ReturnType<typeof createAppContainer>;

/**
 * freezeAppContainer はグローバル Container の依存差し替えを防ぎます。
 */
export function freezeAppContainer(container: AppContainer): AppContainer {
  Object.freeze(container.repositories);
  Object.freeze(container.useCases.community);
  Object.freeze(container.useCases.sync);
  Object.freeze(container.useCases.market);
  Object.freeze(container.useCases);

  return Object.freeze(container);
}

export const appContainer = freezeAppContainer(createAppContainer());
