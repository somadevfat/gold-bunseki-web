import { mock } from 'bun:test';
import { Context } from 'hono';
import { Bindings, AppVariables } from '../types';

/**
 * createMockD1 は D1Database をモックします。
 * @responsibility: テストコードで D1 に対する SQL 実行をシミュレートする。
 * @param results SQL の all() が返す結果
 * @param first SQL の first() が返す結果
 * @return D1Database のモック
 */
export const createMockD1 = (results: unknown[] = [], first: unknown = null) => {
  return {
    prepare: () => ({
      bind: () => ({
        all: () => Promise.resolve({ results }),
        first: () => Promise.resolve(first),
      }),
      all: () => Promise.resolve({ results }),
      first: () => Promise.resolve(first),
    }),
    batch: mock(() => Promise.resolve()),
  } as unknown as D1Database;
};

/**
 * createMockContext は Hono の Context をモックします。
 * @responsibility: コントローラーのテストで Hono のリクエスト・レスポンスをシミュレートする。
 */
export const createMockContext = (
  repos: Partial<AppVariables>, 
  env: Partial<Bindings> = {}, 
  queryData: Record<string, string> = {}
) => {
  return {
    get: (key: keyof AppVariables) => repos[key],
    json: mock((body: unknown, status: number) => ({ body, status })),
    req: {
      valid: () => queryData
    },
    env: env
  } as unknown as Context<{ Bindings: Bindings; Variables: AppVariables }>;
};
