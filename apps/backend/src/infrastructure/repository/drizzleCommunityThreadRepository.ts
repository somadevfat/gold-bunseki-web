import { CommunityThreadRepositoryPort } from '../../application/port/communityThreadRepositoryPort';
import { CommunityThread, CreateCommunityThreadInput } from '../../domain/entities/communityThread';
import { DbType } from '../database/db';
import { communityThreads } from '../database/schema';
import { desc } from 'drizzle-orm';

/**
 * DrizzleCommunityThreadRepository は PostgreSQL (Drizzle) を使用した掲示板スレッドのリポジトリ実装です。
 * @responsibility: スレッドの一覧取得と新規作成を担当する。
 */
export class DrizzleCommunityThreadRepository implements CommunityThreadRepositoryPort {
  constructor(private readonly db: DbType) {}

  /**
   * findAll は掲示板スレッドを新しい順で取得します。
   */
  async findAll(limit: number): Promise<CommunityThread[]> {
    const rows = await this.db
      .select()
      .from(communityThreads)
      .orderBy(desc(communityThreads.createdAt))
      .limit(limit);

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      category: r.category,
      replyCount: r.replyCount,
      createdAt: r.createdAt.toISOString(),
    }));
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
        category: input.category ?? 'General',
      })
      .returning();

    return {
      id: row.id,
      title: row.title,
      body: row.body,
      category: row.category,
      replyCount: row.replyCount,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
