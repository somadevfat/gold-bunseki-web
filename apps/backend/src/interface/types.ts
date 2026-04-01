import { SyncRepositoryPort } from '../application/port/syncRepositoryPort';
import { PriceRepositoryPort } from '../application/port/priceRepositoryPort';
import { ZigZagRepositoryPort } from '../application/port/zigzagRepositoryPort';
import { SessionRepositoryPort } from '../application/port/sessionRepositoryPort';
import { AnalyticsServicePort } from '../application/port/analyticsServicePort';
import { D1BatchRepository } from '../infrastructure/repository/d1BatchRepository';

/**
 * Bindings は Cloudflare Workers の環境変数や D1 などの定義です。
 */
export type Bindings = {
  gold_vola_db: D1Database;
  ANALYTICS_SERVICE_URL: string;
};

/**
 * AppVariables は Hono Context に保存される依存オブジェクトの型定義です。
 */
export type AppVariables = {
  syncRepo: SyncRepositoryPort;
  priceRepo: PriceRepositoryPort;
  zigzagRepo: ZigZagRepositoryPort;
  sessionRepo: SessionRepositoryPort;
  batchRepo: D1BatchRepository;
  analyticsService: AnalyticsServicePort;
};