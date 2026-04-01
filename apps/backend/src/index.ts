import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import * as routes from './interface/routes/openapi';
import { cors } from 'hono/cors';

// Infrastructure
import { D1SyncRepository } from './infrastructure/repository/d1SyncRepository';
import { D1PriceRepository } from './infrastructure/repository/d1PriceRepository';
import { D1ZigZagRepository } from './infrastructure/repository/d1ZigZagRepository';
import { D1SessionRepository } from './infrastructure/repository/d1SessionRepository';
import { D1BatchRepository } from './infrastructure/repository/d1BatchRepository';
import { HttpAnalyticsService } from './infrastructure/external/analyticsServiceImpl';

// Controllers
import { MarketController } from './interface/controller/marketController';
import { SyncController } from './interface/controller/syncController';
import { Bindings, AppVariables } from './interface/types';

/**
 * Gold Volatility Bunseki API (Hono / workerd)
 * @responsibility: エントリポイントとして全ルートを集約し、DIミドルウェアとルーティングを管理する。
 */

const app = new OpenAPIHono<{ Bindings: Bindings; Variables: AppVariables }>();

export type AppType = typeof app;

// CORS設定
app.use('*', cors());

// ==========================================
// 1. DI (Dependency Injection) Middleware
// ==========================================
app.use('*', async (c, next) => {
  const db = c.env.gold_vola_db;
  const analyticsUrl = c.env.ANALYTICS_SERVICE_URL || 'http://127.0.0.1:8000';

  // 各リポジトリ・サービスをインスタンス化してコンテキストにセット
  c.set('priceRepo', new D1PriceRepository(db));
  c.set('zigzagRepo', new D1ZigZagRepository(db));
  c.set('sessionRepo', new D1SessionRepository(db));
  c.set('syncRepo', new D1SyncRepository(db));
  c.set('batchRepo', new D1BatchRepository(db));
  c.set('analyticsService', new HttpAnalyticsService(analyticsUrl));

  await next();
});

// ==========================================
// 2. OpenAPI / Swagger Documentation
// ==========================================
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Gold Volatility Bunseki API',
    description: 'Goldボラティリティ分析ツールのバックエンドAPI',
  },
});

app.get('/swagger', swaggerUI({ url: '/doc' }));

// ==========================================
// 3. Routes / Handlers
// ==========================================

// Health Check
app.openapi(routes.healthRoute, (c) => c.json({ status: 'ok', server: 'Hono/workerd' }));

// Sync Status & Operations
app.openapi(routes.syncStatusRoute, SyncController.getSyncStatus);
app.openapi(routes.triggerSyncRoute, SyncController.triggerSync);
app.openapi(routes.syncDataRoute, SyncController.receiveSyncData);

// Market Data (Price, ZigZag, Sessions)
app.openapi(routes.latestPriceRoute, MarketController.getLatestPrice);
app.openapi(routes.calculateZigZagRoute, MarketController.calculateZigZag);
app.openapi(routes.marketSessionsRoute, MarketController.getRecentSessions);
app.openapi(routes.eventReplayRoute, MarketController.getEventReplay);
app.openapi(routes.marketIndicatorsRoute, MarketController.getIndicators);

export default app;
