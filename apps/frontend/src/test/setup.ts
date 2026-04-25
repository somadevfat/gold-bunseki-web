import { GlobalWindow } from 'happy-dom';
import { server } from './server';
import { afterAll, afterEach, beforeAll } from 'bun:test';

/**
 * ユニットテスト用グローバルセットアップ
 * @responsibility happy-dom によるブラウザ環境の初期化と MSW サーバーのライフサイクル管理を行う。
 */

/* happy-dom でブラウザ環境を初期化（window/document が必要なコードをテスト可能にする） */
const window = new GlobalWindow();
global.window = window as unknown as Window & typeof globalThis;
global.document = window.document as unknown as Document;
global.navigator = window.navigator as unknown as Navigator;
global.Event = window.Event as unknown as typeof Event;
global.CustomEvent = window.CustomEvent as unknown as typeof CustomEvent;
global.HTMLElement = window.HTMLElement as unknown as typeof HTMLElement;
global.HTMLDivElement = window.HTMLDivElement as unknown as typeof HTMLDivElement;

/* MSW: テストスイート開始前に起動し、各テスト後にハンドラーをリセット、終了時にクローズする */
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
