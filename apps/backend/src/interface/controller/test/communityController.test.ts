import { expect, describe, it, mock, beforeEach } from 'bun:test';
import { createCommunityController } from '../communityController';
import { createMockContext } from '../../test/testHelpers';
import { CommunityReply, CommunityThread } from '../../../domain/entities/communityThread';
import { AppContainer } from '../../../app/container';

interface MockResponse {
  body: Record<string, unknown> & {
    threads?: CommunityThread[];
    thread?: CommunityThread;
    replies?: CommunityReply[];
    id?: string;
    title?: string;
    message?: string;
  };
  status: number;
}

const mockThread: CommunityThread = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'CPI発表前後のXAUUSDの値幅について',
  body: '前回CPIでは発表直後の初動より、NY後半の戻りが大きかったです。',
  category: 'Market Discussion',
  replyCount: 12,
  createdAt: '2026-04-01T12:00:00.000Z',
};

const mockReply: CommunityReply = {
  id: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890',
  threadId: mockThread.id,
  body: 'NY後半の戻りを見る観点に同意です。',
  createdAt: '2026-04-01T12:30:00.000Z',
};

/**
 * CommunityController Unit Tests
 * @responsibility: 掲示板スレッドの一覧取得・作成APIの正常系・異常系を検証する。
 */
describe('CommunityController', () => {
  let container: AppContainer;
  let getThreadsExecute: ReturnType<typeof mock>;
  let createThreadExecute: ReturnType<typeof mock>;
  let getThreadDetailExecute: ReturnType<typeof mock>;
  let createReplyExecute: ReturnType<typeof mock>;

  beforeEach(() => {
    getThreadsExecute = mock(() => Promise.resolve([mockThread]));
    createThreadExecute = mock(() => Promise.resolve(mockThread));
    getThreadDetailExecute = mock(() => Promise.resolve({ thread: mockThread, replies: [mockReply] }));
    createReplyExecute = mock(() => Promise.resolve(mockReply));
    container = {
      useCases: {
        community: {
          getThreads: { execute: getThreadsExecute },
          getThreadDetail: { execute: getThreadDetailExecute },
          createThread: { execute: createThreadExecute },
          createReply: { execute: createReplyExecute },
        },
      },
    } as unknown as AppContainer;
  });

  // ==========================================
  // getThreads
  // ==========================================
  describe('getThreads', () => {
    it('スレッド一覧を取得して 200 を返すこと', async () => {
      // ## Arrange ##
      const controller = createCommunityController(container);
      const c = createMockContext({});

      // ## Act ##
      const res = (await controller.getThreads(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(200);
      expect(res.body.threads).toHaveLength(1);
      expect(res.body.threads?.[0].id).toBe(mockThread.id);
      expect(getThreadsExecute).toHaveBeenCalledTimes(1);
    });

    it('リポジトリが空配列を返した場合、空の threads 配列と 200 を返すこと', async () => {
      // ## Arrange ##
      getThreadsExecute = mock(() => Promise.resolve([]));
      container.useCases.community.getThreads.execute = getThreadsExecute;
      const controller = createCommunityController(container);
      const c = createMockContext({});

      // ## Act ##
      const res = (await controller.getThreads(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(200);
      expect(res.body.threads).toHaveLength(0);
    });

    it('ユースケースがエラーをスローした場合、グローバルエラーハンドラーへ委譲すること', async () => {
      // ## Arrange ##
      getThreadsExecute = mock(() => Promise.reject(new Error('DB接続エラー')));
      container.useCases.community.getThreads.execute = getThreadsExecute;
      const controller = createCommunityController(container);
      const c = createMockContext({});

      // ## Act & Assert ##
      await expect(controller.getThreads(c)).rejects.toThrow('DB接続エラー');
    });
  });

  // ==========================================
  // createThread
  // ==========================================
  describe('createThread', () => {
    it('有効な入力でスレッドを作成して 201 を返すこと', async () => {
      // ## Arrange ##
      const body = {
        title: 'CPI発表前後のXAUUSDの値幅について',
        body: '前回CPIでは発表直後の初動より、NY後半の戻りが大きかったです。',
        category: 'Market Discussion',
      };
      const controller = createCommunityController(container);
      const c = createMockContext({}, {}, {}, body);

      // ## Act ##
      const res = (await controller.createThread(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(201);
      expect(res.body.id).toBe(mockThread.id);
      expect(res.body.title).toBe(mockThread.title);
      expect(createThreadExecute).toHaveBeenCalledWith(body);
    });

    it('ユースケースがエラーをスローした場合、グローバルエラーハンドラーへ委譲すること', async () => {
      // ## Arrange ##
      createThreadExecute = mock(() => Promise.reject(new Error('INSERT失敗')));
      container.useCases.community.createThread.execute = createThreadExecute;
      const body = {
        title: 'NFP後の戻りについて',
        body: '本文です。',
        category: 'General',
      };
      const controller = createCommunityController(container);
      const c = createMockContext({}, {}, {}, body);

      // ## Act & Assert ##
      await expect(controller.createThread(c)).rejects.toThrow('INSERT失敗');
    });
  });

  // ==========================================
  // getThreadDetail
  // ==========================================
  describe('getThreadDetail', () => {
    it('スレッド詳細と返信一覧を取得して 200 を返すこと', async () => {
      // ## Arrange ##
      const controller = createCommunityController(container);
      const c = createMockContext({}, {}, { threadId: mockThread.id });

      // ## Act ##
      const res = (await controller.getThreadDetail(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(200);
      expect(res.body.thread?.id).toBe(mockThread.id);
      expect(res.body.replies).toHaveLength(1);
      expect(getThreadDetailExecute).toHaveBeenCalledWith(mockThread.id);
    });

    it('スレッドが存在しない場合 404 を返すこと', async () => {
      // ## Arrange ##
      getThreadDetailExecute = mock(() => Promise.resolve(null));
      container.useCases.community.getThreadDetail.execute = getThreadDetailExecute;
      const controller = createCommunityController(container);
      const c = createMockContext({}, {}, { threadId: mockThread.id });

      // ## Act ##
      const res = (await controller.getThreadDetail(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('スレッドが見つかりません');
    });
  });

  // ==========================================
  // createReply
  // ==========================================
  describe('createReply', () => {
    it('有効な入力で返信を作成して 201 を返すこと', async () => {
      // ## Arrange ##
      const body = {
        body: 'NY後半の戻りを見る観点に同意です。',
      };
      const controller = createCommunityController(container);
      const c = createMockContext({}, {}, { threadId: mockThread.id }, body);

      // ## Act ##
      const res = (await controller.createReply(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(201);
      expect(res.body.id).toBe(mockReply.id);
      expect(createReplyExecute).toHaveBeenCalledWith(mockThread.id, body);
    });

    it('スレッドが存在しない場合 404 を返すこと', async () => {
      // ## Arrange ##
      createReplyExecute = mock(() => Promise.resolve(null));
      container.useCases.community.createReply.execute = createReplyExecute;
      const controller = createCommunityController(container);
      const c = createMockContext({}, {}, { threadId: mockThread.id }, { body: '本文です。' });

      // ## Act ##
      const res = (await controller.createReply(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('スレッドが見つかりません');
    });
  });
});
