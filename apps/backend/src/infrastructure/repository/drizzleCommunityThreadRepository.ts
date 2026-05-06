import { CommunityThreadRepositoryPort } from '../../application/port/communityThreadRepositoryPort';
import {
  CommunityReply,
  CommunityThread,
  CreateCommunityReplyInput,
  CreateCommunityThreadInput,
} from '../../domain/entities/communityThread';
import { DbType } from '../database/db';
import { communityReplies, communityThreads } from '../database/schema';
import { asc, desc, eq, sql } from 'drizzle-orm';

/**
 * DrizzleCommunityThreadRepository は PostgreSQL (Drizzle) を使用した掲示板スレッドのリポジトリ実装です。
 * @responsibility: スレッドの一覧取得と新規作成を担当する。
 */
export class DrizzleCommunityThreadRepository implements CommunityThreadRepositoryPort {
  constructor(private readonly db: DbType) {}

  private mapThread(row: typeof communityThreads.$inferSelect): CommunityThread {
    return {
      id: row.id,
      title: row.title,
      body: row.body,
      category: row.category,
      replyCount: row.replyCount,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private mapReply(row: typeof communityReplies.$inferSelect): CommunityReply {
    return {
      id: row.id,
      threadId: row.threadId,
      body: row.body,
      createdAt: row.createdAt.toISOString(),
    };
  }

  /**
   * findAll は掲示板スレッドを新しい順で取得します。
   */
  async findAll(limit: number): Promise<CommunityThread[]> {
    const rows = await this.db
      .select()
      .from(communityThreads)
      .orderBy(desc(communityThreads.createdAt))
      .limit(limit);

    return rows.map((row) => this.mapThread(row));
  }

  /**
   * findById は指定したIDの掲示板スレッドを取得します。
   */
  async findById(threadId: string): Promise<CommunityThread | null> {
    const rows = await this.db
      .select()
      .from(communityThreads)
      .where(eq(communityThreads.id, threadId))
      .limit(1);

    return rows[0] ? this.mapThread(rows[0]) : null;
  }

  /**
   * findReplies は指定したスレッドの返信を古い順で取得します。
   */
  async findReplies(threadId: string): Promise<CommunityReply[]> {
    const rows = await this.db
      .select()
      .from(communityReplies)
      .where(eq(communityReplies.threadId, threadId))
      .orderBy(asc(communityReplies.createdAt));

    return rows.map((row) => this.mapReply(row));
  }

  /**
   * create は新規スレッドを作成して返します。
   */
  async create(input: CreateCommunityThreadInput): Promise<CommunityThread> {
    const [row] = await this.db
      .insert(communityThreads)
      .values({
        title: input.title,
        body: input.body,
        category: input.category,
      })
      .returning();

    return this.mapThread(row);
  }

  /**
   * createReply は返信作成とスレッドの返信数更新を同一トランザクションで行います。
   */
  async createReply(threadId: string, input: CreateCommunityReplyInput): Promise<CommunityReply> {
    const row = await this.db.transaction(async (tx) => {
      const [reply] = await tx
        .insert(communityReplies)
        .values({
          threadId,
          body: input.body,
        })
        .returning();

      await tx
        .update(communityThreads)
        .set({
          replyCount: sql`${communityThreads.replyCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(communityThreads.id, threadId));

      return reply;
    });

    return this.mapReply(row);
  }
}
