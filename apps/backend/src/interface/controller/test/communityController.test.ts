import { expect, describe, it, mock, beforeEach } from 'bun:test';
import { CommunityController } from '../communityController';
import { createMockContext } from '../../test/testHelpers';
import { AppVariables } from '../../types';
import { CommunityThread } from '../../../domain/entities/communityThread';

interface MockResponse {
  body: Record<string, unknown> & {
    threads?: CommunityThread[];
    error?: string;
    id?: string;
    title?: string;
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

/**
 * CommunityController Unit Tests
 * @responsibility: 掲示板スレッドの一覧取得・作成APIの正常系・異常系を検証する。
 */
describe('CommunityController', () => {
  it('クラスをインスタンス化できること', () => {
    expect(new CommunityController()).toBeInstanceOf(CommunityController);
  });

  let mockRepos: Partial<AppVariables>;

  beforeEach(() => {
    mockRepos = {
      communityThreadRepo: {
        findAll: mock(() => Promise.resolve([mockThread])),
        create: mock(() => Promise.resolve(mockThread)),
      } as unknown as AppVariables['communityThreadRepo'],
    };
  });

  // ==========================================
  // getThreads
  // ==========================================
  describe('getThreads', () => {
    it('スレッド一覧を取得して 200 を返すこと', async () => {
      // ## Arrange ##
      const c = createMockContext(mockRepos);

      // ## Act ##
      const res = (await CommunityController.getThreads(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(200);
      expect(res.body.threads).toHaveLength(1);
      expect(res.body.threads?.[0].id).toBe(mockThread.id);
    });

    it('リポジトリが空配列を返した場合、空の threads 配列と 200 を返すこと', async () => {
      // ## Arrange ##
      if (mockRepos.communityThreadRepo) {
        mockRepos.communityThreadRepo.findAll = mock(() => Promise.resolve([]));
      }
      const c = createMockContext(mockRepos);

      // ## Act ##
      const res = (await CommunityController.getThreads(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(200);
      expect(res.body.threads).toHaveLength(0);
    });

    it('リポジトリがエラーをスローした場合、500 を返すこと', async () => {
      // ## Arrange ##
      if (mockRepos.communityThreadRepo) {
        mockRepos.communityThreadRepo.findAll = mock(() =>
          Promise.reject(new Error('DB接続エラー')),
        );
      }
      const c = createMockContext(mockRepos);

      // ## Act ##
      const res = (await CommunityController.getThreads(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('スレッド一覧の取得に失敗しました');
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
      const c = createMockContext(mockRepos, {}, body as Record<string, string>);

      // ## Act ##
      const res = (await CommunityController.createThread(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(201);
      expect(res.body.id).toBe(mockThread.id);
      expect(res.body.title).toBe(mockThread.title);
    });

    it('リポジトリがエラーをスローした場合、500 を返すこと', async () => {
      // ## Arrange ##
      if (mockRepos.communityThreadRepo) {
        mockRepos.communityThreadRepo.create = mock(() =>
          Promise.reject(new Error('INSERT失敗')),
        );
      }
      const body = {
        title: 'NFP後の戻りについて',
        body: '本文です。',
        category: 'General',
      };
      const c = createMockContext(mockRepos, {}, body as Record<string, string>);

      // ## Act ##
      const res = (await CommunityController.createThread(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('スレッドの作成に失敗しました');
    });
  });
});
