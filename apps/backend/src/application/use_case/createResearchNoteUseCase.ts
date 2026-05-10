import { ResearchNoteRepositoryPort } from '../port/researchNoteRepositoryPort';
import { CreateResearchNoteInput, ResearchNote } from '../../domain/entities/researchNote';

/**
 * CreateResearchNoteUseCase は新規リサーチメモを作成するユースケースです。
 * @responsibility: バリデーション済みの入力を受け取り、リポジトリを通じてメモを永続化する。
 */
export class CreateResearchNoteUseCase {
  constructor(private readonly repo: ResearchNoteRepositoryPort) {}

  async execute(input: CreateResearchNoteInput): Promise<ResearchNote> {
    return this.repo.create(input);
  }
}
