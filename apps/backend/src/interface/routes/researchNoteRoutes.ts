import { OpenAPIHono } from '@hono/zod-openapi';
import { AppContainer } from '../../app/container';
import { createResearchNoteController } from '../controller/researchNoteController';
import { AppVariables, Bindings } from '../types';
import {
  deleteResearchNoteRoute,
  createResearchNoteRoute,
  researchNotesRoute,
  updateResearchNoteRoute,
} from './openapi';

type BackendApp = OpenAPIHono<{ Bindings: Bindings; Variables: AppVariables }>;

/**
 * registerResearchNoteRoutes はリサーチメモAPIのルート登録を行います。
 * @responsibility リサーチメモドメインの route 定義と controller を結びつける。
 */
export function registerResearchNoteRoutes(app: BackendApp, container: AppContainer): void {
  const controller = createResearchNoteController(container);

  app.openapi(researchNotesRoute, controller.getNotes);
  app.openapi(createResearchNoteRoute, controller.createNote);
  app.openapi(updateResearchNoteRoute, controller.updateNote);
  app.openapi(deleteResearchNoteRoute, controller.deleteNote);
}
