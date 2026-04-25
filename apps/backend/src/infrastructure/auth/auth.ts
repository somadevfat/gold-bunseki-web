import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { readRequiredEnv } from "../config/env";
import { db } from "../database/db";
import { getAllowedOrigins } from "../security/origins";

/*
 * Better Auth インスタンスの設定
 * @responsibility: 認証（OAuth連携やセッション管理）のコア機能を提供し、DB（Drizzle）と接続する。
 */
export const auth = betterAuth({
    /* CSRF対策・セッション署名に使うシークレット */
    secret: readRequiredEnv("BETTER_AUTH_SECRET"),
    /* バックエンド自身のBaseURL（CSRF判定に必要） */
    baseURL: readRequiredEnv("BETTER_AUTH_URL"),
    database: drizzleAdapter(db, {
        provider: "pg", // PostgreSQL
    }),
    socialProviders: {
        google: {
            clientId: readRequiredEnv("GOOGLE_CLIENT_ID"),
            clientSecret: readRequiredEnv("GOOGLE_CLIENT_SECRET"),
        }
    },
    trustedOrigins: getAllowedOrigins(),
});
