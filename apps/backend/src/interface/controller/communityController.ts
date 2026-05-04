import { Context } from 'hono';
import { Bindings, AppVariables } from '../types';
import { CreateCommunityThreadInput } from '../../domain/entities/communityThread';
import { AppContainer } from '../../app/container';

/**
 * createCommunityController は掲示板スレッドに関するリクエストを処理するハンドラを作成します。
 * @responsibility 掲示板スレッドに関する HTTP リクエストのバリデーションとユースケースの実行を制御する。
 */
export function createCommunityController(container: AppContainer) {
  return {
    /**
     * スレッド一覧の取得
     * @responsibility ユースケースを実行し、スレッド一覧を JSON 形式で返す。
     */
    getThreads: async (c: Context<{ Bindings: Bindings; Variables: AppVariables }>) => {
      const threads = await container.useCases.community.getThreads.execute();
      return c.json({ threads }, 200);
    },

    /**
     * スレッドの新規作成
     * @responsibility リクエストボディをバリデーションし、ユースケースを実行して新規スレッドを返す。
     */
    createThread: async (c: Context<{ Bindings: Bindings; Variables: AppVariables }>) => {
      const input = (await c.req.valid('json' as never)) as CreateCommunityThreadInput;
      const thread = await container.useCases.community.createThread.execute(input);
      return c.json(thread, 201);
    },
  };
}
