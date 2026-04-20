import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../database/db";

/*
 * Better Auth インスタンスの設定
 * @responsibility: 認証（OAuth連携やセッション管理）のコア機能を提供し、DB（Drizzle）と接続する。
 */
export const auth = betterAuth({
    /* CSRF対策・セッション署名に使うシークレット（env未設定時のフォールバックあり） */
    secret: process.env.BETTER_AUTH_SECRET ?? "dev_fallback_secret_please_set_env",
    /* バックエンド自身のBaseURL（CSRF判定に必要） */
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    database: drizzleAdapter(db, {
        provider: "pg", // PostgreSQL
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }
    },
    trustedOrigins: [
        "http://localhost:3001",
        "http://localhost:5173",
        "https://gold-vola-frontend.somahiranodev.workers.dev",
        "https://fanda-dev.com",
        "https://www.fanda-dev.com",
    ],
});
