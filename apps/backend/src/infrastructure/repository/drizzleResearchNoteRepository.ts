import { desc } from 'drizzle-orm';
import { ResearchNoteRepositoryPort } from '../../application/port/researchNoteRepositoryPort';
import { CreateResearchNoteInput, ResearchNote } from '../../domain/entities/researchNote';
import { DbType } from '../database/db';
import { researchNotes } from '../database/schema';

/**
 * DrizzleResearchNoteRepository は PostgreSQL (Drizzle) を使用したリサーチメモのリポジトリ実装です。
 * @responsibility: リサーチメモの作成と一覧取得を担当する。
 */
export class DrizzleResearchNoteRepository implements ResearchNoteRepositoryPort {
  constructor(private readonly db: DbType) {}

  private mapNote(row: typeof researchNotes.$inferSelect): ResearchNote {
    return {
      id: row.id,
      title: row.title,
      body: row.body,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  /**
   * findAll はリサーチメモを新しい順で取得します。
   */
  async findAll(limit: number): Promise<ResearchNote[]> {
    const rows = await this.db
      .select()
      .from(researchNotes)
      .orderBy(desc(researchNotes.createdAt))
      .limit(limit);

    return rows.map((row) => this.mapNote(row));
  }

  /**
   * create は新規リサーチメモを作成して返します。
   */
  async create(input: CreateResearchNoteInput): Promise<ResearchNote> {
    const [row] = await this.db
      .insert(researchNotes)
      .values({
        title: input.title,
        body: input.body,
      })
      .returning();

    return this.mapNote(row);
  }
}
