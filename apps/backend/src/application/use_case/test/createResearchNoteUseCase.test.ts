import { expect, describe, it, mock } from 'bun:test';
import { ResearchNoteRepositoryPort } from '../../port/researchNoteRepositoryPort';
import { CreateResearchNoteUseCase } from '../createResearchNoteUseCase';
import { CreateResearchNoteInput, ResearchNote } from '../../../domain/entities/researchNote';

const mockCreated: ResearchNote = {
  id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'CPI発表前の観察メモ',
  body: '発表前はNY序盤の押し目を待つ。',
  createdAt: '2026-04-01T12:00:00.000Z',
  updatedAt: '2026-04-01T12:00:00.000Z',
};

const validInput: CreateResearchNoteInput = {
  title: 'CPI発表前の観察メモ',
  body: '発表前はNY序盤の押し目を待つ。',
};

const createMockRepo = (overrides: Partial<ResearchNoteRepositoryPort> = {}): ResearchNoteRepositoryPort => ({
  findAll: mock(() => Promise.resolve([])),
  create: mock(() => Promise.resolve(mockCreated)),
  update: mock(() => Promise.resolve(mockCreated)),
  delete: mock(() => Promise.resolve(true)),
  ...overrides,
});

/**
 * CreateResearchNoteUseCase Unit Tests
 * @responsibility: リサーチメモ作成のビジネスロジックを検証する。
 */
describe('CreateResearchNoteUseCase (Unit Tests)', () => {
  describe('正常系', () => {
    it('入力を渡してリポジトリの create を呼び出し、作成されたメモを返すこと', async () => {
      // ## Arrange ##
      const createMock = mock(() => Promise.resolve(mockCreated));
      const mockRepo = createMockRepo({ create: createMock });
      const useCase = new CreateResearchNoteUseCase(mockRepo);

      // ## Act ##
      const result = await useCase.execute(validInput);

      // ## Assert ##
      expect(createMock).toHaveBeenCalledWith(validInput);
      expect(result.id).toBe(mockCreated.id);
      expect(result.title).toBe(mockCreated.title);
    });
  });

  describe('異常系', () => {
    it('リポジトリがエラーをスローした場合、そのまま伝播すること', async () => {
      // ## Arrange ##
      const mockRepo = createMockRepo({
        create: mock(() => Promise.reject(new Error('INSERT失敗'))),
      });
      const useCase = new CreateResearchNoteUseCase(mockRepo);

      // ## Act & Assert ##
      await expect(useCase.execute(validInput)).rejects.toThrow('INSERT失敗');
    });
  });
});
