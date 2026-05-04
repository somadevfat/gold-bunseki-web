import { OpenAPIHono } from '@hono/zod-openapi';
import { AppContainer } from '../../app/container';
import { createSyncController } from '../controller/syncController';
import { AppVariables, Bindings } from '../types';
import { syncDataRoute, syncSeedRoute, syncStatusRoute } from './openapi';

type BackendApp = OpenAPIHono<{ Bindings: Bindings; Variables: AppVariables }>;

/**
 * registerSyncRoutes は同期APIのルート登録を行います。
 * @responsibility Syncドメインの route 定義と controller を結びつける。
 */
export function registerSyncRoutes(app: BackendApp, container: AppContainer): void {
  const controller = createSyncController(container);

  app.openapi(syncStatusRoute, controller.getSyncStatus);
  app.openapi(syncDataRoute, controller.receiveSyncData);
  app.openapi(syncSeedRoute, controller.receiveSeedData);
}
