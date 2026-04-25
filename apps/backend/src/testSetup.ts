// テスト実行時の環境変数
process.env.API_TOKEN = "ci-test-token";
process.env.DATABASE_URL = "postgresql://mock:mock@localhost:5432/mock";
delete process.env.ALLOWED_ORIGINS;
process.env.BETTER_AUTH_SECRET = "ci-test-better-auth-secret";
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.GOOGLE_CLIENT_ID = "mock-client";
process.env.GOOGLE_CLIENT_SECRET = "mock-secret";
