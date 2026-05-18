import { mock } from "bun:test";
import { Context } from "hono";
import { Bindings, AppVariables } from "../types";
import { DbType } from "../../infrastructure/database/db";

type MockQueryBuilder = {
  select: ReturnType<typeof mock>;
  from: ReturnType<typeof mock>;
  where: ReturnType<typeof mock>;
  orderBy: ReturnType<typeof mock>;
  limit: ReturnType<typeof mock>;
  groupBy: ReturnType<typeof mock>;
  insert: ReturnType<typeof mock>;
  update: ReturnType<typeof mock>;
  delete: ReturnType<typeof mock>;
  values: ReturnType<typeof mock>;
  set: ReturnType<typeof mock>;
  returning: ReturnType<typeof mock>;
  onConflictDoNothing: ReturnType<typeof mock>;
  onConflictDoUpdate: ReturnType<typeof mock>;
  transaction: ReturnType<typeof mock>;
  then: (resolve: (val: unknown[]) => void) => void;
};

/**
 * createMockDrizzle は Drizzle ORM (PostgresJS) をモックします。
 * @responsibility: テストコードで Drizzle のチェーンメソッドとデータ取得をシミュレートする。
 */
export const createMockDrizzle = <T = unknown>(results: T[] = []) => {
  const queryMock = {
    select: mock(() => queryMock),
    from: mock(() => queryMock),
    where: mock(() => queryMock),
    orderBy: mock(() => queryMock),
    limit: mock(() => queryMock),
    groupBy: mock(() => queryMock),
    insert: mock(() => queryMock),
    update: mock(() => queryMock),
    delete: mock(() => queryMock),
    values: mock(() => queryMock),
    set: mock(() => queryMock),
    returning: mock(() => queryMock),
    onConflictDoNothing: mock(() => queryMock),
    onConflictDoUpdate: mock(() => queryMock),
    transaction: mock((cb: (db: unknown) => Promise<unknown>) => cb(queryMock)),
    // Promise.resolve に thenable なオブジェクトを返すことで await 可能にする
    then: (resolve: (val: T[]) => void) => resolve(results),
  };
  return queryMock as unknown as DbType & MockQueryBuilder;
};

/**
 * createMockContext は Hono の Context をモックします。
 * @responsibility: コントローラーのテストで Hono のリクエスト・レスポンスをシミュレートする。
 */
export const createMockContext = (
  variables: Partial<AppVariables>,
  env: Partial<Bindings> = {},
  queryData: Record<string, string> = {},
  jsonBody: Record<string, unknown> = {},
) => {
  return {
    get: (key: keyof AppVariables) => variables[key],
    json: mock((body: unknown, status: number) => ({ body, status })),
    req: {
      valid: mock(async (target?: string) => {
        if (target === "json") return jsonBody;
        return queryData;
      }),
    },
    env,
  } as unknown as Context<{ Bindings: Bindings; Variables: AppVariables }>;
};
