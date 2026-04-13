// テスト実行時の環境変数デフォルト値（未設定の場合のみ適用）
process.env.API_TOKEN ??= "ci-test-token";
process.env.DATABASE_URL ??= "postgresql://mock:mock@localhost:5432/mock";
