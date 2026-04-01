import { SessionRepositoryPort } from '../port/sessionRepositoryPort';

/**
 * GetRecentEventNamesUseCase は直近発表された経済指標のリストを取得します。
 * @responsibility: リポジトリを呼び出し、動的なUI生成用の指標名リストを返す。
 */
export class GetRecentEventNamesUseCase {
  constructor(private sessionRepo: SessionRepositoryPort) {}

  /**
   * execute は指定件数分の指標名を返します。
   */
  async execute(limit: number = 30): Promise<string[]> {
    return this.sessionRepo.getRecentEventNames(limit);
  }
}
