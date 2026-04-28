import { expect, describe, it, mock } from 'bun:test';
import { GetCommunityThreadsUseCase } from '../getCommunityThreadsUseCase';
import { CommunityThreadRepositoryPort } from '../../port/communityThreadRepositoryPort';
import { CommunityThread } from '../../../domain/entities/communityThread';

/**
 * GetCommunityThreadsUseCase Unit Tests
 * @responsibility: スレッド一覧取得のビジネスロジックを検証する。
 */
describe('GetCommunityThreadsUseCase (Unit Tests)', () => {
  const mockThread: CommunityThread = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    title: 'CPI発表前後のXAUUSDの値幅について',
    body: '前回CPIでは発表直後の初動より、NY後半の戻りが大きかったです。',
    category: 'Market Discussion',
    replyCount: 12,
    createdAt: '2026-04-01T12:00:00.000Z',
  };

  describe('正常系', () => {
    it('リポジトリが返したスレッド一覧をそのまま返すこと', async () => {
      // ## Arrange ##
      const mockRepo: CommunityThreadRepositoryPort = {
        findAll: mock(() => Promise.resolve([mockThread])),
        create: mock(() => Promise.resolve(mockThread)),
      };
      const useCase = new GetCommunityThreadsUseCase(mockRepo);

      // ## Act ##
      const result = await useCase.execute();

      // ## Assert ##
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockThread.id);
      expect(result[0].title).toBe(mockThread.title);
    });

    it('リポジトリが空配列を返した場合、空配列を返すこと', async () => {
      // ## Arrange ##
      const mockRepo: CommunityThreadRepositoryPort = {
        findAll: mock(() => Promise.resolve([])),
        create: mock(() => Promise.resolve(mockThread)),
      };
      const useCase = new GetCommunityThreadsUseCase(mockRepo);

      // ## Act ##
      const result = await useCase.execute();

      // ## Assert ##
      expect(result).toHaveLength(0);
    });

    it('デフォルト limit (50) で findAll を呼び出すこと', async () => {
      // ## Arrange ##
      const findAllMock = mock(() => Promise.resolve([mockThread]));
      const mockRepo: CommunityThreadRepositoryPort = {
        findAll: findAllMock,
        create: mock(() => Promise.resolve(mockThread)),
      };
      const useCase = new GetCommunityThreadsUseCase(mockRepo);

      // ## Act ##
      await useCase.execute();

      // ## Assert ##
      expect(findAllMock).toHaveBeenCalledWith(50);
    });
  });

  describe('異常系', () => {
    it('リポジトリがエラーをスローした場合、そのまま伝播すること', async () => {
      // ## Arrange ##
      const mockRepo: CommunityThreadRepositoryPort = {
        findAll: mock(() => Promise.reject(new Error('DB接続エラー'))),
        create: mock(() => Promise.resolve(mockThread)),
      };
      const useCase = new GetCommunityThreadsUseCase(mockRepo);

      // ## Act & Assert ##
      await expect(useCase.execute()).rejects.toThrow('DB接続エラー');
    });
  });
});
