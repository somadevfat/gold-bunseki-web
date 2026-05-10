import { CreateResearchNoteInput, ResearchNote } from '../../domain/entities/researchNote';

/**
 * ResearchNoteRepositoryPort はリサーチメモを管理するリポジトリインターフェースです。
 * @responsibility: メモの作成と一覧取得を永続化層へ委譲する境界を定義する。
 */
export interface ResearchNoteRepositoryPort {
  /**
   * リサーチメモ一覧を新しい順で取得します。
   */
  findAll(limit: number): Promise<ResearchNote[]>;

  /**
   * 新規リサーチメモを作成して返します。
   */
  create(input: CreateResearchNoteInput): Promise<ResearchNote>;
}
