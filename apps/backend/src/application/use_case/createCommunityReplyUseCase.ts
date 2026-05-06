import { CommunityThreadRepositoryPort } from '../port/communityThreadRepositoryPort';
import { CommunityReply, CreateCommunityReplyInput } from '../../domain/entities/communityThread';

/**
 * CreateCommunityReplyUseCase は掲示板スレッドへの返信を作成するユースケースです。
 * @responsibility: 対象スレッドの存在確認後、返信を永続化する。
 */
export class CreateCommunityReplyUseCase {
  constructor(private readonly repo: CommunityThreadRepositoryPort) {}

  async execute(threadId: string, input: CreateCommunityReplyInput): Promise<CommunityReply | null> {
    const thread = await this.repo.findById(threadId);

    if (!thread) {
      return null;
    }

    return this.repo.createReply(threadId, input);
  }
}
