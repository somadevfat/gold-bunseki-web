import { PriceRepositoryPort } from '../../application/port/priceRepositoryPort';
import { PriceRecord } from '../../domain/entities/price';
import { DbType } from '../database/db';
import { prices } from '../database/schema';
import { desc } from 'drizzle-orm';

/**
 * DrizzlePriceRepository は PostgreSQL (Drizzle) を使用した価格データのリポジトリ実装です。
 * @responsibility: Drizzle ORM を通じて PostgreSQL に対してクエリを実行し、価格レコードを取得・保存する。
 */
export class DrizzlePriceRepository implements PriceRepositoryPort {
  constructor(private db: DbType) {}

  /**
   * getLatestPrice は最新の価格 1 件を DB から取得します。
   */
  async getLatestPrice(): Promise<PriceRecord | null> {
    const [result] = await this.db
      .select()
      .from(prices)
      .orderBy(desc(prices.timestamp))
      .limit(1);

    return result ?? null;
  }

  /**
   * getRecentPrices は直近の価格履歴を取得します。
   */
  async getRecentPrices(limit: number): Promise<PriceRecord[]> {
    const results = await this.db
      .select()
      .from(prices)
      .orderBy(desc(prices.timestamp))
      .limit(limit);

    return results;
  }
}
