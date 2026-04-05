import { SyncRepositoryPort } from '../../application/port/syncRepositoryPort';
import { SyncStatus } from '../../domain/entities/syncStatus';
import { DbType } from '../database/db';
import { priceCandles, sessionVolatilities, economicEvents } from '../database/schema';
import { max, count, isNotNull } from 'drizzle-orm';

/**
 * DrizzleSyncRepository は PostgreSQL (Drizzle) を使用した同期ステータスのリポジトリ実装です。
 * @responsibility: Drizzle ORM を通じて PostgreSQL に対してクエリを実行し、同期ステータスを取得する。
 */
export class DrizzleSyncRepository implements SyncRepositoryPort {
  constructor(private db: DbType) {}

  /**
   * getSyncStatus は現在の同期進捗を集計して返します。
   */
  async getSyncStatus(): Promise<SyncStatus> {
    // 1. 各テーブルの最新タイムスタンプと件数を取得
    const [candleRes] = await this.db.select({ lastCandle: max(priceCandles.datetimeJst), totalCandles: count(priceCandles.datetimeJst) }).from(priceCandles);
    const [sessionRes] = await this.db.select({ lastSession: max(sessionVolatilities.date) }).from(sessionVolatilities);
    const [eventRes] = await this.db.select({ lastEvent: max(economicEvents.datetimeJst) }).from(economicEvents).where(isNotNull(economicEvents.actual));

    const lastCandleStr = candleRes?.lastCandle ?? '1970-01-01 00:00:00';
    const lastSessionStr = sessionRes?.lastSession ?? '1970-01-01';
    const lastEventStr = eventRes?.lastEvent ?? '1970-01-01 00:00:00';
    const totalCandles = Number(candleRes?.totalCandles ?? 0);

    // 健康診断 (24時間以上更新がなければ Stale)
    const lastCandle = new Date(lastCandleStr);
    const now = new Date();
    const syncHealth = (now.getTime() - lastCandle.getTime()) > 24 * 60 * 60 * 1000 ? 'Stale' : 'Healthy';

    return {
      lastCandleAt: lastCandleStr,
      lastSessionAt: lastSessionStr,
      lastEventAt: lastEventStr,
      totalCandles: totalCandles,
      syncHealth: syncHealth,
    };
  }
}
