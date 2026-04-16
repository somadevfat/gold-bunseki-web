import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../database/db";

/*
 * Better Auth インスタンスの設定
 * @responsibility: 認証（OAuth連携やセッション管理）のコア機能を提供し、DB（Drizzle）と接続する。
 */
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // PostgreSQL
    }),
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        // 必要に応じて後でGoogle等も追加可能
    },
});
