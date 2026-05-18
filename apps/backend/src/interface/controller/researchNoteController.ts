import { Context } from 'hono';
import { AppContainer } from '../../app/container';
import {
  CreateResearchNoteInput,
  UpdateResearchNoteInput,
} from '../../domain/entities/researchNote';
import { AppVariables, Bindings } from '../types';

/**
 * createResearchNoteController はリサーチメモに関するリクエストを処理するハンドラを作成します。
 * @responsibility リサーチメモの HTTP リクエストとユースケース実行を接続する。
 */
export function createResearchNoteController(container: AppContainer) {
  return {
    /**
     * リサーチメモ一覧の取得
     * @responsibility ユースケースを実行し、保存済みメモ一覧を JSON 形式で返す。
     */
    getNotes: async (c: Context<{ Bindings: Bindings; Variables: AppVariables }>) => {
      const notes = await container.useCases.researchNotes.getNotes.execute();
      return c.json({ notes }, 200);
    },

    /**
     * リサーチメモの新規作成
     * @responsibility リクエストボディをバリデーションし、ユースケースを実行して新規メモを返す。
     */
    createNote: async (c: Context<{ Bindings: Bindings; Variables: AppVariables }>) => {
      const input = (await c.req.valid('json' as never)) as CreateResearchNoteInput;
      const note = await container.useCases.researchNotes.createNote.execute(input);
      return c.json(note, 201);
    },

    /**
     * リサーチメモの更新
     * @responsibility URLパラメータとボディを受け取り、対象メモを更新する。
     */
    updateNote: async (c: Context<{ Bindings: Bindings; Variables: AppVariables }>) => {
      const { noteId } = (await c.req.valid('param' as never)) as { noteId: string };
      const input = (await c.req.valid('json' as never)) as UpdateResearchNoteInput;
      const note = await container.useCases.researchNotes.updateNote.execute(noteId, input);

      if (!note) {
        return c.json({ message: 'リサーチメモが見つかりません' }, 404);
      }

      return c.json(note, 200);
    },

    /**
     * リサーチメモの削除
     * @responsibility URLパラメータを受け取り、対象メモを削除する。
     */
    deleteNote: async (c: Context<{ Bindings: Bindings; Variables: AppVariables }>) => {
      const { noteId } = (await c.req.valid('param' as never)) as { noteId: string };
      const deleted = await container.useCases.researchNotes.deleteNote.execute(noteId);

      if (!deleted) {
        return c.json({ message: 'リサーチメモが見つかりません' }, 404);
      }

      return c.json({ success: true }, 200);
    },
  };
}
