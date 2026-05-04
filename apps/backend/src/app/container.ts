import { GetCommunityThreadsUseCase } from "../application/use_case/getCommunityThreadsUseCase";
import { CreateCommunityThreadUseCase } from "../application/use_case/createCommunityThreadUseCase";
import { db, DbType } from "../infrastructure/database/db";
import { DrizzleBatchRepository } from "../infrastructure/repository/drizzleBatchRepository";
import { DrizzleCommunityThreadRepository } from "../infrastructure/repository/drizzleCommunityThreadRepository";
import { DrizzlePriceRepository } from "../infrastructure/repository/drizzlePriceRepository";
import { DrizzleSessionRepository } from "../infrastructure/repository/drizzleSessionRepository";
import { DrizzleSyncRepository } from "../infrastructure/repository/drizzleSyncRepository";
import { DrizzleZigZagRepository } from "../infrastructure/repository/drizzleZigZagRepository";

/**
 * createAppContainer はアプリケーション全体の依存関係を生成して配線します。
 * @responsibility Repository / UseCase のインスタンス生成を一箇所に集約する。
 */
export function createAppContainer(database: DbType = db) {
  const communityThreadRepo = new DrizzleCommunityThreadRepository(database);

  return {
    repositories: {
      priceRepo: new DrizzlePriceRepository(database),
      zigzagRepo: new DrizzleZigZagRepository(database),
      sessionRepo: new DrizzleSessionRepository(database),
      syncRepo: new DrizzleSyncRepository(database),
      batchRepo: new DrizzleBatchRepository(database),
      communityThreadRepo,
    },
    useCases: {
      community: {
        getThreads: new GetCommunityThreadsUseCase(communityThreadRepo),
        createThread: new CreateCommunityThreadUseCase(communityThreadRepo),
      },
    },
  };
}

export type AppContainer = ReturnType<typeof createAppContainer>;

/**
 * freezeAppContainer はグローバルContainerの依存差し替えを防ぎます。
 * @responsibility アプリ実行中に依存配線が誤って変更されないようにする。
 */
export function freezeAppContainer(container: AppContainer): AppContainer {
  Object.freeze(container.repositories);
  Object.freeze(container.useCases.community);
  Object.freeze(container.useCases);

  return Object.freeze(container);
}

export const appContainer = freezeAppContainer(createAppContainer());
