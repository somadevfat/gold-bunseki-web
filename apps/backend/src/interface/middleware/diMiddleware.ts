import { MiddlewareHandler } from 'hono';

// Infrastructure
import { db } from '../../infrastructure/database/db';
import { DrizzleSyncRepository } from '../../infrastructure/repository/drizzleSyncRepository';
import { DrizzlePriceRepository } from '../../infrastructure/repository/drizzlePriceRepository';
import { DrizzleZigZagRepository } from '../../infrastructure/repository/drizzleZigZagRepository';
import { DrizzleSessionRepository } from '../../infrastructure/repository/drizzleSessionRepository';
import { DrizzleBatchRepository } from '../../infrastructure/repository/drizzleBatchRepository';

/**
 * diMiddleware は、リクエスト毎に必要な依存オブジェクトを Context に注入します。
 * @responsibility: インフラ層の具体的実装をインスタンス化し、インターフェースを通じてアプリケーション層に提供する。
 */
export const diMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {

    // 依存オブジェクトの注入
    // Note: パフォーマンス向上のため、必要に応じてシングルトン化を検討可能ですが、
    // 現時点ではクリーンなステート管理のためリクエスト毎にセットします。
    c.set('priceRepo', new DrizzlePriceRepository(db));
    c.set('zigzagRepo', new DrizzleZigZagRepository(db));
    c.set('sessionRepo', new DrizzleSessionRepository(db));
    c.set('syncRepo', new DrizzleSyncRepository(db));
    c.set('batchRepo', new DrizzleBatchRepository(db));

    await next();
  };
};
