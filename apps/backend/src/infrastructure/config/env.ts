/**
 * readRequiredEnv は必須環境変数を安全に読み取る関数です。
 * @responsibility 認証やAPI保護に必要な環境変数の未設定を起動時に検出する。
 */
export function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
