import { CommunityThreadRepositoryPort } from '../port/communityThreadRepositoryPort';
import { CommunityThread, CreateCommunityThreadInput } from '../../domain/entities/communityThread';

/**
 * CreateCommunityThreadUseCase は新規掲示板スレッドを作成するユースケースです。
 * @responsibility: バリデーション済みの入力を受け取り、リポジトリを通じてスレッドを永続化する。
 */
export class CreateCommunityThreadUseCase {
  constructor(private readonly repo: CommunityThreadRepositoryPort) {}

  async execute(input: CreateCommunityThreadInput): Promise<CommunityThread> {
    return this.repo.create(input);
  }
}
