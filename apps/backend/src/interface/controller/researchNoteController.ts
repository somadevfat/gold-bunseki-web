import { Context } from 'hono';
import { AppContainer } from '../../app/container';
import { CreateResearchNoteInput } from '../../domain/entities/researchNote';
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
  };
}
