import { CalculateZigZagUseCase } from "../application/use_case/calculateZigZagUseCase";
import { CreateCommunityReplyUseCase } from "../application/use_case/createCommunityReplyUseCase";
import { CreateCommunityThreadUseCase } from "../application/use_case/createCommunityThreadUseCase";
import { CreateResearchNoteUseCase } from "../application/use_case/createResearchNoteUseCase";
import { DeleteResearchNoteUseCase } from "../application/use_case/deleteResearchNoteUseCase";
import { GetCommunityThreadDetailUseCase } from "../application/use_case/getCommunityThreadDetailUseCase";
import { GetCommunityThreadsUseCase } from "../application/use_case/getCommunityThreadsUseCase";
import { GetLatestPriceUseCase } from "../application/use_case/getLatestPriceUseCase";
import { GetRecentEventNamesUseCase } from "../application/use_case/getRecentEventNamesUseCase";
import { GetRecentSessionsUseCase } from "../application/use_case/getRecentSessionsUseCase";
import { GetRecentSessionsWithAutoSyncUseCase } from "../application/use_case/getRecentSessionsWithAutoSyncUseCase";
import { GetReplayDataUseCase } from "../application/use_case/getReplayDataUseCase";
import { GetResearchNotesUseCase } from "../application/use_case/getResearchNotesUseCase";
import { GetSyncStatusUseCase } from "../application/use_case/getSyncStatusUseCase";
import { UpdateResearchNoteUseCase } from "../application/use_case/updateResearchNoteUseCase";
import { db, DbType } from "../infrastructure/database/db";
import { HttpAnalyticsService } from "../infrastructure/external/analyticsServiceImpl";
import { HttpAnalyticsSyncPull } from "../infrastructure/external/analyticsSyncPullImpl";
import { DrizzleBatchRepository } from "../infrastructure/repository/drizzleBatchRepository";
import { DrizzleCommunityThreadRepository } from "../infrastructure/repository/drizzleCommunityThreadRepository";
import { DrizzlePriceRepository } from "../infrastructure/repository/drizzlePriceRepository";
import { DrizzleResearchNoteRepository } from "../infrastructure/repository/drizzleResearchNoteRepository";
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
  const researchNoteRepo = new DrizzleResearchNoteRepository(database);
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

  const getRecentSessionsInner = new GetRecentSessionsUseCase(sessionRepo);
  const analyticsSyncPull = new HttpAnalyticsSyncPull();

  return {
    repositories: {
      priceRepo,
      zigzagRepo,
      sessionRepo,
      syncRepo,
      batchRepo,
      communityThreadRepo,
      researchNoteRepo,
    },
    useCases: {
      community: {
        getThreads: new GetCommunityThreadsUseCase(communityThreadRepo),
        getThreadDetail: new GetCommunityThreadDetailUseCase(communityThreadRepo),
        createThread: new CreateCommunityThreadUseCase(communityThreadRepo),
        createReply: new CreateCommunityReplyUseCase(communityThreadRepo),
      },
      researchNotes: {
        getNotes: new GetResearchNotesUseCase(researchNoteRepo),
        createNote: new CreateResearchNoteUseCase(researchNoteRepo),
        updateNote: new UpdateResearchNoteUseCase(researchNoteRepo),
        deleteNote: new DeleteResearchNoteUseCase(researchNoteRepo),
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
        getRecentSessions: new GetRecentSessionsWithAutoSyncUseCase(
          getRecentSessionsInner,
          batchRepo,
          analyticsSyncPull,
        ),
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
  Object.freeze(container.useCases.researchNotes);
  Object.freeze(container.useCases.sync);
  Object.freeze(container.useCases.market);
  Object.freeze(container.useCases);

  return Object.freeze(container);
}

export const appContainer = freezeAppContainer(createAppContainer());
