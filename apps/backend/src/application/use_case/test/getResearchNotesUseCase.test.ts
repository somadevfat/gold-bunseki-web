import { expect, describe, it, mock } from 'bun:test';
import { ResearchNoteRepositoryPort } from '../../port/researchNoteRepositoryPort';
import { GetResearchNotesUseCase } from '../getResearchNotesUseCase';
import { ResearchNote } from '../../../domain/entities/researchNote';

const mockNote: ResearchNote = {
  id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'CPI発表前の観察メモ',
  body: '発表前はNY序盤の押し目を待つ。',
  createdAt: '2026-04-01T12:00:00.000Z',
  updatedAt: '2026-04-01T12:00:00.000Z',
};

const createMockRepo = (overrides: Partial<ResearchNoteRepositoryPort> = {}): ResearchNoteRepositoryPort => ({
  findAll: mock(() => Promise.resolve([mockNote])),
  create: mock(() => Promise.resolve(mockNote)),
  ...overrides,
});

/**
 * GetResearchNotesUseCase Unit Tests
 * @responsibility: 保存済みリサーチメモ一覧取得のビジネスロジックを検証する。
 */
describe('GetResearchNotesUseCase (Unit Tests)', () => {
  describe('正常系', () => {
    it('デフォルト件数でリポジトリの findAll を呼び出し、メモ一覧を返すこと', async () => {
      // ## Arrange ##
      const findAllMock = mock(() => Promise.resolve([mockNote]));
      const mockRepo = createMockRepo({ findAll: findAllMock });
      const useCase = new GetResearchNotesUseCase(mockRepo);

      // ## Act ##
      const result = await useCase.execute();

      // ## Assert ##
      expect(findAllMock).toHaveBeenCalledWith(50);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe(mockNote.title);
    });

    it('リポジトリが空配列を返した場合、空の一覧を返すこと', async () => {
      // ## Arrange ##
      const mockRepo = createMockRepo({
        findAll: mock(() => Promise.resolve([])),
      });
      const useCase = new GetResearchNotesUseCase(mockRepo);

      // ## Act ##
      const result = await useCase.execute();

      // ## Assert ##
      expect(result).toEqual([]);
    });
  });

  describe('異常系', () => {
    it('リポジトリがエラーをスローした場合、そのまま伝播すること', async () => {
      // ## Arrange ##
      const mockRepo = createMockRepo({
        findAll: mock(() => Promise.reject(new Error('SELECT失敗'))),
      });
      const useCase = new GetResearchNotesUseCase(mockRepo);

      // ## Act & Assert ##
      await expect(useCase.execute()).rejects.toThrow('SELECT失敗');
    });
  });
});
