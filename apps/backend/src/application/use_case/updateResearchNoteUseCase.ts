import { ResearchNoteRepositoryPort } from '../port/researchNoteRepositoryPort';
import { ResearchNote, UpdateResearchNoteInput } from '../../domain/entities/researchNote';

/**
 * UpdateResearchNoteUseCase は保存済みリサーチメモを更新するユースケースです。
 * @responsibility: バリデーション済みの入力を受け取り、対象メモの内容を更新する。
 */
export class UpdateResearchNoteUseCase {
  constructor(private readonly repo: ResearchNoteRepositoryPort) {}

  async execute(noteId: string, input: UpdateResearchNoteInput): Promise<ResearchNote | null> {
    return this.repo.update(noteId, input);
  }
}
