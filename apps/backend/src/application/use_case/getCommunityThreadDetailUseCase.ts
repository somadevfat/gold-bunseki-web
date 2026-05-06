import { CommunityThreadRepositoryPort } from '../port/communityThreadRepositoryPort';
import { CommunityThreadDetail } from '../../domain/entities/communityThread';

/**
 * GetCommunityThreadDetailUseCase は掲示板スレッド詳細と返信一覧を取得するユースケースです。
 * @responsibility: スレッド本文と返信一覧をリポジトリから集約して返す。
 */
export class GetCommunityThreadDetailUseCase {
  constructor(private readonly repo: CommunityThreadRepositoryPort) {}

  async execute(threadId: string): Promise<CommunityThreadDetail | null> {
    const thread = await this.repo.findById(threadId);

    if (!thread) {
      return null;
    }

    const replies = await this.repo.findReplies(threadId);

    return {
      thread,
      replies,
    };
  }
}
