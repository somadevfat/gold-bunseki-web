import { ResearchNoteRepositoryPort } from '../port/researchNoteRepositoryPort';
import { ResearchNote } from '../../domain/entities/researchNote';

/**
 * GetResearchNotesUseCase は保存済みリサーチメモ一覧を取得するユースケースです。
 * @responsibility: リポジトリを通じてメモ一覧を新しい順で返す。
 */
export class GetResearchNotesUseCase {
  constructor(private readonly repo: ResearchNoteRepositoryPort) {}

  async execute(limit = 50): Promise<ResearchNote[]> {
    return this.repo.findAll(limit);
  }
}
