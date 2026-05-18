import { desc } from 'drizzle-orm';
import { ResearchNoteRepositoryPort } from '../../application/port/researchNoteRepositoryPort';
import {
  CreateResearchNoteInput,
  ResearchNote,
  UpdateResearchNoteInput,
} from '../../domain/entities/researchNote';
import { DbType } from '../database/db';
import { researchNotes } from '../database/schema';
import { eq } from 'drizzle-orm';

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

  /**
   * update は既存リサーチメモを更新して返します。
   */
  async update(noteId: string, input: UpdateResearchNoteInput): Promise<ResearchNote | null> {
    const [row] = await this.db
      .update(researchNotes)
      .set({
        title: input.title,
        body: input.body,
        updatedAt: new Date(),
      })
      .where(eq(researchNotes.id, noteId))
      .returning();

    return row ? this.mapNote(row) : null;
  }

  /**
   * delete は既存リサーチメモを削除します。
   */
  async delete(noteId: string): Promise<boolean> {
    const rows = await this.db
      .delete(researchNotes)
      .where(eq(researchNotes.id, noteId))
      .returning({ id: researchNotes.id });

    return rows.length > 0;
  }
}
