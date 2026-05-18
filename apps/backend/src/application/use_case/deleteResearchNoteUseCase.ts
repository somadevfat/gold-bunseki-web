import { ResearchNoteRepositoryPort } from '../port/researchNoteRepositoryPort';

/**
 * DeleteResearchNoteUseCase は保存済みリサーチメモを削除するユースケースです。
 * @responsibility: 対象IDのメモ削除をリポジトリへ委譲し、削除成否を返す。
 */
export class DeleteResearchNoteUseCase {
  constructor(private readonly repo: ResearchNoteRepositoryPort) {}

  async execute(noteId: string): Promise<boolean> {
    return this.repo.delete(noteId);
  }
}
