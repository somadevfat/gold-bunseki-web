import { ZigZagRepositoryPort } from '../../application/port/zigzagRepositoryPort';
import { ZigZagPoint } from '../../domain/entities/zigzag';
import { DbType } from '../database/db';
import { zigzagPoints } from '../database/schema';

/**
 * DrizzleZigZagRepository は PostgreSQL (Drizzle) を使用した ZigZag データのリポジトリ実装です。
 * @responsibility: 計算された波の頂点データを安全、かつ高速に PostgreSQL に書き込む。
 */
export class DrizzleZigZagRepository implements ZigZagRepositoryPort {
  constructor(private db: DbType) {}

  /**
   * savePoints は複数の転換データを一元保存します。
   */
  async savePoints(points: ZigZagPoint[]): Promise<void> {
    if (points.length === 0) return;

    // ON CONFLICT DO NOTHING で重複を避けつつ一括保存
    await this.db
      .insert(zigzagPoints)
      .values(points)
      .onConflictDoNothing();
  }
}
