import { Context } from 'hono';
import { Bindings, AppVariables } from '../types';
import { GetCommunityThreadsUseCase } from '../../application/use_case/getCommunityThreadsUseCase';
import { CreateCommunityThreadUseCase } from '../../application/use_case/createCommunityThreadUseCase';

/**
 * CommunityController は掲示板スレッドに関するリクエストを処理します。
 */
export class CommunityController {
  /* c8 ignore next */
  constructor() {}

  /**
   * スレッド一覧の取得
   */
  static async getThreads(
    c: Context<{ Bindings: Bindings; Variables: AppVariables }>,
  ) {
    try {
      const useCase = new GetCommunityThreadsUseCase(c.get('communityThreadRepo'));
      const threads = await useCase.execute();
      return c.json({ threads }, 200);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[Community Threads Error]', error.message);
      return c.json({ error: 'スレッド一覧の取得に失敗しました' }, 500);
    }
  }

  /**
   * スレッドの新規作成
   */
  static async createThread(
    c: Context<{ Bindings: Bindings; Variables: AppVariables }>,
  ) {
    try {
      const body = c.req.valid('json' as never) as { title: string; body: string; category?: string };
      const useCase = new CreateCommunityThreadUseCase(c.get('communityThreadRepo'));
      const thread = await useCase.execute({
        title: body.title,
        body: body.body,
        category: body.category ?? 'General',
      });
      return c.json(thread, 201);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[Community Thread Create Error]', error.message);
      return c.json({ error: 'スレッドの作成に失敗しました' }, 500);
    }
  }
}
