/**
 * Bindings は 環境変数などの定義です。
 */
export type Bindings = {
  DATABASE_URL: string;
  ANALYTICS_SERVICE_URL?: string;
};

/**
 * AppVariables は Hono Context に保存される変数の型です。
 */
export type AppVariables = {
  requestId: string;
};
