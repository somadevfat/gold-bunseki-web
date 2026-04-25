export const defaultAllowedOrigins = [
  "http://localhost:3001",
  "https://gold-vola-frontend.somahiranodev.workers.dev",
  "https://fanda-dev.com",
  "https://www.fanda-dev.com",
];

/**
 * getAllowedOrigins は CORS と Better Auth で共有する許可済み Origin 一覧を返します。
 * @responsibility 環境変数で上書き可能な許可 Origin を正規化し、認証・CORS 設定の不一致を防ぐ。
 */
export function getAllowedOrigins(envValue = process.env.ALLOWED_ORIGINS): string[] {
  if (!envValue) {
    return defaultAllowedOrigins;
  }

  const origins = envValue
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : defaultAllowedOrigins;
}
