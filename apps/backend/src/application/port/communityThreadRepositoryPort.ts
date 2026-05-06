import {
  CommunityReply,
  CommunityThread,
  CreateCommunityReplyInput,
  CreateCommunityThreadInput,
} from '../../domain/entities/communityThread';

/**
 * CommunityThreadRepositoryPort は掲示板スレッドを管理するリポジトリインターフェースです。
 * @responsibility: スレッドの一覧取得・新規作成を担当する。
 */
export interface CommunityThreadRepositoryPort {
  /**
   * 掲示板スレッド一覧を新しい順で取得します。
   */
  findAll(limit: number): Promise<CommunityThread[]>;

  /**
   * IDを指定して掲示板スレッドを取得します。
   */
  findById(threadId: string): Promise<CommunityThread | null>;

  /**
   * 指定したスレッドの返信一覧を古い順で取得します。
   */
  findReplies(threadId: string): Promise<CommunityReply[]>;

  /**
   * 新規スレッドを作成して返します。
   */
  create(input: CreateCommunityThreadInput): Promise<CommunityThread>;

  /**
   * 指定したスレッドへ返信を作成して返します。
   */
  createReply(threadId: string, input: CreateCommunityReplyInput): Promise<CommunityReply>;
}
