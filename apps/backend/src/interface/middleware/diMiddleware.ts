import { MiddlewareHandler } from 'hono';
import { AppContainer, appContainer } from '../../app/container';

/**
 * diMiddleware は、リクエスト毎に必要な依存オブジェクトを Context に注入します。
 * @responsibility: インフラ層の具体的実装をインスタンス化し、インターフェースを通じてアプリケーション層に提供する。
 */
export const diMiddleware = (container: AppContainer = appContainer): MiddlewareHandler => {
  return async (c, next) => {
    const { repositories } = container;

    // 依存オブジェクトの注入。インスタンス生成は AppContainer に集約する。
    c.set('priceRepo', repositories.priceRepo);
    c.set('zigzagRepo', repositories.zigzagRepo);
    c.set('sessionRepo', repositories.sessionRepo);
    c.set('syncRepo', repositories.syncRepo);
    c.set('batchRepo', repositories.batchRepo);

    await next();
  };
};
