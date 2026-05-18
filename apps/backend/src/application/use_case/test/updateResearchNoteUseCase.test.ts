import { expect, describe, it, mock } from 'bun:test';
import { ResearchNoteRepositoryPort } from '../../port/researchNoteRepositoryPort';
import { ResearchNote, UpdateResearchNoteInput } from '../../../domain/entities/researchNote';
import { UpdateResearchNoteUseCase } from '../updateResearchNoteUseCase';

const mockNote: ResearchNote = {
  id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'CPI発表前の観察メモ',
  body: '発表前はNY序盤の押し目を待つ。',
  createdAt: '2026-04-01T12:00:00.000Z',
  updatedAt: '2026-04-01T12:30:00.000Z',
};

const validInput: UpdateResearchNoteInput = {
  title: 'CPI発表後の観察メモ',
  body: '初動とNY後半の戻りを比較する。',
};

const createMockRepo = (overrides: Partial<ResearchNoteRepositoryPort> = {}): ResearchNoteRepositoryPort => ({
  findAll: mock(() => Promise.resolve([])),
  create: mock(() => Promise.resolve(mockNote)),
  update: mock(() => Promise.resolve(mockNote)),
  delete: mock(() => Promise.resolve(true)),
  ...overrides,
});

describe('UpdateResearchNoteUseCase (Unit Tests)', () => {
  it('入力を渡してリポジトリの update を呼び出し、更新されたメモを返すこと', async () => {
    // ## Arrange ##
    const updateMock = mock(() => Promise.resolve(mockNote));
    const mockRepo = createMockRepo({ update: updateMock });
    const useCase = new UpdateResearchNoteUseCase(mockRepo);

    // ## Act ##
    const result = await useCase.execute(mockNote.id, validInput);

    // ## Assert ##
    expect(updateMock).toHaveBeenCalledWith(mockNote.id, validInput);
    expect(result?.id).toBe(mockNote.id);
  });

  it('対象メモが存在しない場合、null を返すこと', async () => {
    // ## Arrange ##
    const mockRepo = createMockRepo({
      update: mock(() => Promise.resolve(null)),
    });
    const useCase = new UpdateResearchNoteUseCase(mockRepo);

    // ## Act ##
    const result = await useCase.execute(mockNote.id, validInput);

    // ## Assert ##
    expect(result).toBeNull();
  });
});
