import { SyncRepositoryPort } from '../application/port/syncRepositoryPort';
import { PriceRepositoryPort } from '../application/port/priceRepositoryPort';
import { ZigZagRepositoryPort } from '../application/port/zigzagRepositoryPort';
import { SessionRepositoryPort } from '../application/port/sessionRepositoryPort';
import { DrizzleBatchRepository } from '../infrastructure/repository/drizzleBatchRepository';
import { AnalyticsServicePort } from '../application/port/analyticsServicePort';

/**
 * Bindings は 環境変数などの定義です。
 */
export type Bindings = {
  DATABASE_URL: string;
  ANALYTICS_SERVICE_URL?: string;
};

/**
 * AppVariables は Hono Context に保存される依存オブジェクトの型定義です。
 */
export type AppVariables = {
  requestId: string;
  syncRepo: SyncRepositoryPort;
  priceRepo: PriceRepositoryPort;
  zigzagRepo: ZigZagRepositoryPort;
  sessionRepo: SessionRepositoryPort;
  batchRepo: DrizzleBatchRepository;
  analyticsService: AnalyticsServicePort;
};