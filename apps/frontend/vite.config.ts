import vinext from "vinext";
import { defineConfig, loadEnv } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

/**
 * Vite 設定ファイル
 * @responsibility ビルド・開発サーバーの構成を定義する。
 * loadEnv を使い NEXT_PUBLIC_API_URL を実行時に評価する。
 * これにより Playwright が webServer の env で値を渡せる。
 */
export default defineConfig(({ mode }) => {
  /* process.env を優先し、なければ .env ファイルからロード */
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
    ?? env.NEXT_PUBLIC_API_URL
    ?? 'http://localhost:3000';

  return {
    define: {
      /* ビルド時に文字列として埋め込む（ランタイム参照のため process.env は不可） */
      'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(apiUrl),
    },
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
      }),
    ],
  };
});
