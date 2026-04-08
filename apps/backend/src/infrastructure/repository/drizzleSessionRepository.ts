import { SessionRepositoryPort } from '../../application/port/sessionRepositoryPort';
import { SessionVolatility, SessionThreshold } from '../../domain/entities/session';
import { Candle, HistoricalAverage } from '../../domain/entities/replay';
import { DbType } from '../database/db';
import { sessionVolatilities, sessionThresholds, priceCandles, economicEvents } from '../database/schema';
import { desc, asc, like, sql, and, eq } from 'drizzle-orm';

/**
 * DrizzleSessionRepository は PostgreSQL (Drizzle) を使用した地合いデータ・統計データのリポジトリ実装です。
 * @responsibility: ボラティリティ集計、チャート再現、過去統計のクエリを担当する。
 */
export class DrizzleSessionRepository implements SessionRepositoryPort {
  constructor(private db: DbType) {}

  /**
   * findRecentSessions は直近のセッション別ボラティリティを返します。
   */
  async findRecentSessions(limit: number): Promise<SessionVolatility[]> {
    const results = await this.db
      .select()
      .from(sessionVolatilities)
      .orderBy(desc(sessionVolatilities.date), desc(sessionVolatilities.startTimeJst))
      .limit(limit);

    return results.map(r => ({
      id: r.id,
      date: r.date,
      sessionName: r.sessionName,
      startTimeJst: r.startTimeJst,
      endTimeJst: r.endTimeJst,
      volatilityPoints: r.volatilityPoints,
      hasEvent: r.hasEvent,
      hasHighImpactEvent: r.hasHighImpactEvent,
      eventsLinked: r.eventsLinked ?? '',
      condition: 'Small' // Default, will be calculated in use case if needed
    }));
  }

  /**
   * findPreviousEvent は指定指標の「前回発表」セッションを取得します。
   */
  async findPreviousEvent(eventName: string): Promise<SessionVolatility | null> {
    const searchPattern = `%${eventName}%`;
    
    const results = await this.db
      .select({
        id: sessionVolatilities.id,
        date: sessionVolatilities.date,
        sessionName: sessionVolatilities.sessionName,
        startTimeJst: sessionVolatilities.startTimeJst,
        endTimeJst: sessionVolatilities.endTimeJst,
        volatilityPoints: sessionVolatilities.volatilityPoints,
        hasEvent: sessionVolatilities.hasEvent,
        hasHighImpactEvent: sessionVolatilities.hasHighImpactEvent,
        eventsLinked: sessionVolatilities.eventsLinked,
        exactEventTime: sql<string | null>`(${this.db
          .select({ datetimeJst: economicEvents.datetimeJst })
          .from(economicEvents)
          .where(and(
            sql`substring(${economicEvents.datetimeJst}, 1, 10) = ${sessionVolatilities.date}`,
            like(economicEvents.eventName, searchPattern)
          ))
          .limit(1)})`
      })
      .from(sessionVolatilities)
      .where(like(sessionVolatilities.eventsLinked, searchPattern))
      .orderBy(desc(sessionVolatilities.date), desc(sessionVolatilities.startTimeJst))
      .limit(2);

    if (results.length === 0) return null;

    // JSTでの今日の日付を取得
    const nowJST = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
    const latest = results[0];

    let target = latest;
    if (latest.date === nowJST && results.length > 1) {
      target = results[1];
    } else if (latest.date === nowJST) {
      return null;
    }

    return {
      id: target.id,
      date: target.date,
      sessionName: target.sessionName,
      startTimeJst: target.startTimeJst,
      endTimeJst: target.endTimeJst,
      volatilityPoints: target.volatilityPoints,
      hasEvent: target.hasEvent,
      hasHighImpactEvent: target.hasHighImpactEvent,
      eventsLinked: target.eventsLinked ?? '',
      exactEventTimeJst: target.exactEventTime || undefined,
      condition: 'Small'
    };
  }

  /**
   * getCandles は特定のチャートデータを取得します。
   */
  async getCandles(date: string, sessionName: string): Promise<Candle[]> {
    const results = await this.db
      .select({
        datetimeJst: priceCandles.datetimeJst,
        open: priceCandles.openPrice,
        high: priceCandles.highPrice,
        low: priceCandles.lowPrice,
        close: priceCandles.closePrice,
      })
      .from(priceCandles)
      .where(and(
        sql`substring(${priceCandles.datetimeJst}, 1, 10) = ${date}`,
        eq(priceCandles.sessionName, sessionName)
      ))
      .orderBy(asc(priceCandles.datetimeJst));
      
    return results;
  }

  /**
   * getThresholds は現在定義されている判定閾値を返します。
   */
  async getThresholds(): Promise<Record<string, SessionThreshold>> {
    const results = await this.db
      .select()
      .from(sessionThresholds);

    const map: Record<string, SessionThreshold> = {};
    results.forEach(t => {
      map[t.sessionName] = {
        sessionName: t.sessionName,
        smallThreshold: t.smallThreshold,
        largeThreshold: t.largeThreshold
      };
    });
    return map;
  }

  /**
   * getEventStats は過去の全データから指標別の平均ボラティリティを地合い別に算出します。
   */
  async getEventStats(eventName: string, thresholds: Record<string, SessionThreshold>): Promise<HistoricalAverage[]> {
    const searchPattern = `%${eventName}%`;
    const results = await this.db
      .select({
        sessionName: sessionVolatilities.sessionName,
        volatilityPoints: sessionVolatilities.volatilityPoints
      })
      .from(sessionVolatilities)
      .where(like(sessionVolatilities.eventsLinked, searchPattern));

    const stats: Record<string, { sum: number, count: number }> = {
      'Large': { sum: 0, count: 0 },
      'Mid': { sum: 0, count: 0 },
      'Small': { sum: 0, count: 0 }
    };

    results.forEach(r => {
      const t = thresholds[r.sessionName];
      let cond = 'Small';
      if (t) {
        if (r.volatilityPoints > t.largeThreshold) cond = 'Large';
        else if (r.volatilityPoints > t.smallThreshold) cond = 'Mid';
      }
      stats[cond].sum += r.volatilityPoints;
      stats[cond].count++;
    });

    return (['Large', 'Mid', 'Small'] as const).map(cond => ({
      eventName,
      condition: cond,
      averageVola: stats[cond].count > 0 ? stats[cond].sum / stats[cond].count : 0,
      count: stats[cond].count
    }));
  }

  /**
   * getRecentEventNames は直近発表されたユニークな経済指標名をリストとして返します。
   */
  async getRecentEventNames(limit: number): Promise<string[]> {
    const results = await this.db
      .select({
        eventName: economicEvents.eventName,
        lastDate: sql<string>`MAX(${economicEvents.datetimeJst})`
      })
      .from(economicEvents)
      .groupBy(economicEvents.eventName)
      .orderBy(desc(sql`last_date`))
      .limit(limit);

    return results.map(r => r.eventName);
  }
}
