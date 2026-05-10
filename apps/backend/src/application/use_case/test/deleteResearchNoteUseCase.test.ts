import { expect, describe, it, mock } from 'bun:test';
import { ResearchNoteRepositoryPort } from '../../port/researchNoteRepositoryPort';
import { ResearchNote } from '../../../domain/entities/researchNote';
import { DeleteResearchNoteUseCase } from '../deleteResearchNoteUseCase';

const mockNote: ResearchNote = {
  id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'CPI発表前の観察メモ',
  body: '発表前はNY序盤の押し目を待つ。',
  createdAt: '2026-04-01T12:00:00.000Z',
  updatedAt: '2026-04-01T12:00:00.000Z',
};

const createMockRepo = (overrides: Partial<ResearchNoteRepositoryPort> = {}): ResearchNoteRepositoryPort => ({
  findAll: mock(() => Promise.resolve([])),
  create: mock(() => Promise.resolve(mockNote)),
  update: mock(() => Promise.resolve(mockNote)),
  delete: mock(() => Promise.resolve(true)),
  ...overrides,
});

describe('DeleteResearchNoteUseCase (Unit Tests)', () => {
  it('入力IDを渡してリポジトリの delete を呼び出し、削除成功を返すこと', async () => {
    // ## Arrange ##
    const deleteMock = mock(() => Promise.resolve(true));
    const mockRepo = createMockRepo({ delete: deleteMock });
    const useCase = new DeleteResearchNoteUseCase(mockRepo);

    // ## Act ##
    const result = await useCase.execute(mockNote.id);

    // ## Assert ##
    expect(deleteMock).toHaveBeenCalledWith(mockNote.id);
    expect(result).toBe(true);
  });

  it('対象メモが存在しない場合、false を返すこと', async () => {
    // ## Arrange ##
    const mockRepo = createMockRepo({
      delete: mock(() => Promise.resolve(false)),
    });
    const useCase = new DeleteResearchNoteUseCase(mockRepo);

    // ## Act ##
    const result = await useCase.execute(mockNote.id);

    // ## Assert ##
    expect(result).toBe(false);
  });
});
