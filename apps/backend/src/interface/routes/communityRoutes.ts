import { OpenAPIHono } from '@hono/zod-openapi';
import { AppContainer } from '../../app/container';
import { createCommunityController } from '../controller/communityController';
import { AppVariables, Bindings } from '../types';
import { communityThreadsRoute, createCommunityThreadRoute } from './openapi';

type BackendApp = OpenAPIHono<{ Bindings: Bindings; Variables: AppVariables }>;

/**
 * registerCommunityRoutes は掲示板APIのルート登録を行います。
 * @responsibility 掲示板ドメインの route 定義と controller を結びつける。
 */
export function registerCommunityRoutes(app: BackendApp, container: AppContainer): void {
  const controller = createCommunityController(container);

  app.openapi(communityThreadsRoute, controller.getThreads);
  app.openapi(createCommunityThreadRoute, controller.createThread);
}
