import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * ユニットテスト用 MSW サーバー
 * @responsibility テストスイート全体で共有する MSW サーバーインスタンスを提供する。
 */
export const server = setupServer(...handlers);
