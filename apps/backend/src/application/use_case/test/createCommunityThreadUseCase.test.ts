import { expect, describe, it, mock } from 'bun:test';
import { CreateCommunityThreadUseCase } from '../createCommunityThreadUseCase';
import { CommunityThreadRepositoryPort } from '../../port/communityThreadRepositoryPort';
import { CommunityThread, CreateCommunityThreadInput } from '../../../domain/entities/communityThread';

/**
 * CreateCommunityThreadUseCase Unit Tests
 * @responsibility: スレッド作成のビジネスロジックを検証する。
 */
describe('CreateCommunityThreadUseCase (Unit Tests)', () => {
  const mockCreated: CommunityThread = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    title: 'NFP後の戻りについて',
    body: 'NFP直後のスプレッド拡大後、戻り幅が気になります。',
    category: 'Market Discussion',
    replyCount: 0,
    createdAt: '2026-04-10T09:00:00.000Z',
  };

  const validInput: CreateCommunityThreadInput = {
    title: 'NFP後の戻りについて',
    body: 'NFP直後のスプレッド拡大後、戻り幅が気になります。',
    category: 'Market Discussion',
  };

  describe('正常系', () => {
    it('入力を渡してリポジトリの create を呼び出し、作成されたスレッドを返すこと', async () => {
      // ## Arrange ##
      const createMock = mock(() => Promise.resolve(mockCreated));
      const mockRepo: CommunityThreadRepositoryPort = {
        findAll: mock(() => Promise.resolve([])),
        create: createMock,
      };
      const useCase = new CreateCommunityThreadUseCase(mockRepo);

      // ## Act ##
      const result = await useCase.execute(validInput);

      // ## Assert ##
      expect(createMock).toHaveBeenCalledWith(validInput);
      expect(result.id).toBe(mockCreated.id);
      expect(result.title).toBe(mockCreated.title);
      expect(result.replyCount).toBe(0);
    });
  });

  describe('異常系', () => {
    it('リポジトリがエラーをスローした場合、そのまま伝播すること', async () => {
      // ## Arrange ##
      const mockRepo: CommunityThreadRepositoryPort = {
        findAll: mock(() => Promise.resolve([])),
        create: mock(() => Promise.reject(new Error('INSERT失敗'))),
      };
      const useCase = new CreateCommunityThreadUseCase(mockRepo);

      // ## Act & Assert ##
      await expect(useCase.execute(validInput)).rejects.toThrow('INSERT失敗');
    });
  });
});
