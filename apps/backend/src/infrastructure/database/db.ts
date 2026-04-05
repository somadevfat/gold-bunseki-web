import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * DB 接続設定
 * @responsibility: PostgreSQL (Docker) への接続を管理し、Drizzle ORM インスタンスを提供する。
 */

const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/gold_vola_db';

// 接続プールの作成
const client = postgres(connectionString);

// Drizzle インスタンスの作成
export const db = drizzle(client, { schema });

export type DbType = typeof db;
