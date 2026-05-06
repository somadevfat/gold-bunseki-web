import { Context } from 'hono';
import { Bindings, AppVariables } from '../types';
import { CreateCommunityReplyInput, CreateCommunityThreadInput } from '../../domain/entities/communityThread';
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

    /**
     * スレッド詳細の取得
     * @responsibility スレッド本文と返信一覧を JSON 形式で返す。
     */
    getThreadDetail: async (c: Context<{ Bindings: Bindings; Variables: AppVariables }>) => {
      const { threadId } = (await c.req.valid('param' as never)) as { threadId: string };
      const detail = await container.useCases.community.getThreadDetail.execute(threadId);

      if (!detail) {
        return c.json({ message: 'スレッドが見つかりません' }, 404);
      }

      return c.json(detail, 200);
    },

    /**
     * スレッド返信の新規作成
     * @responsibility リクエストボディをバリデーションし、返信作成ユースケースを実行する。
     */
    createReply: async (c: Context<{ Bindings: Bindings; Variables: AppVariables }>) => {
      const { threadId } = (await c.req.valid('param' as never)) as { threadId: string };
      const input = (await c.req.valid('json' as never)) as CreateCommunityReplyInput;
      const reply = await container.useCases.community.createReply.execute(threadId, input);

      if (!reply) {
        return c.json({ message: 'スレッドが見つかりません' }, 404);
      }

      return c.json(reply, 201);
    },
  };
}
