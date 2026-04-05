import { mock } from 'bun:test';
import { Context } from 'hono';
import { Bindings, AppVariables } from '../types';
import { DbType } from '../../infrastructure/database/db';

/**
 * createMockDrizzle は Drizzle ORM (PostgresJS) をモックします。
 * @responsibility: テストコードで Drizzle のチェーンメソッドとデータ取得をシミュレートする。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const createMockDrizzle = (results: any[] = []) => {
  const queryMock = {
    select: mock(() => queryMock),
    from: mock(() => queryMock),
    where: mock(() => queryMock),
    orderBy: mock(() => queryMock),
    limit: mock(() => queryMock),
    offset: mock(() => queryMock),
    groupBy: mock(() => queryMock),
    insert: mock(() => queryMock),
    values: mock(() => queryMock),
    onConflictDoNothing: mock(() => queryMock),
    onConflictUpdate: mock(() => queryMock),
    as: mock(() => queryMock),
    transaction: mock(async (cb: any) => await cb(queryMock)),
    // Promise.resolve に thenable なオブジェクトを返すことで await 可能にする
    then: (resolve: any) => resolve(results),
  };
  return queryMock as unknown as DbType;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

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
