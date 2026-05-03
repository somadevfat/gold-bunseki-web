import { appContainer } from "./app/container";
import { createApp, resolveCorsOrigin } from "./app/createApp";

/**
 * Gold Volatility Bunseki API (Hono / Bun.serve)
 * @responsibility: アプリケーションのエントリポイント。各コンポーネントを組み立て、APIを起動する。
 */
/**
 * validateStartupEnv はAPI起動に必要な環境変数を検証する関数です。
 * @responsibility APIトークン未設定のまま同期APIを公開しないよう起動を停止する。
 */
export function validateStartupEnv(): void {
  const apiToken = process.env.API_TOKEN;
  if (!apiToken) {
    console.error("💣 FATAL ERROR: API_TOKEN environment variable is not set.");
    console.error(
      "Please set API_TOKEN in your environment (e.g. .env) to secure the API.",
    );
    process.exit(1);
  }
}
validateStartupEnv();
const apiToken = process.env.API_TOKEN as string;

const app = createApp(appContainer, { apiToken });
export type AppType = typeof app;
export { app, resolveCorsOrigin };

/* Bun.serve でHTTPサーバーを起動 (Docker/VPS環境用) */
const port = parseInt(process.env.PORT ?? "3000", 10);

export default {
  port,
  fetch: app.fetch,
};
