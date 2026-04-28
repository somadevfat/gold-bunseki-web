import { CommunityThreadRepositoryPort } from '../port/communityThreadRepositoryPort';
import { CommunityThread } from '../../domain/entities/communityThread';

/**
 * GetCommunityThreadsUseCase は掲示板スレッド一覧を取得するユースケースです。
 * @responsibility: リポジトリを通じてスレッド一覧を新しい順で返す。
 */
export class GetCommunityThreadsUseCase {
  constructor(private readonly repo: CommunityThreadRepositoryPort) {}

  async execute(limit = 50): Promise<CommunityThread[]> {
    return this.repo.findAll(limit);
  }
}
