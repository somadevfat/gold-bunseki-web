import { CommunityThread, CreateCommunityThreadInput } from '../../domain/entities/communityThread';

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
   * 新規スレッドを作成して返します。
   */
  create(input: CreateCommunityThreadInput): Promise<CommunityThread>;
}
