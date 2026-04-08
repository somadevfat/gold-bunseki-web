import { DbType } from '../database/db';
import { 
  economicEvents, 
  sessionVolatilities, 
  priceCandles, 
  sessionThresholds, 
  prices, 
  zigzagPoints 
} from '../database/schema';
import { sql } from 'drizzle-orm';

export interface SyncPayload {
  events?: Array<{
    datetimeJst: string;
    eventName: string;
    importance: string;
    actual: number | null;
    forecast: number | null;
    previous: number | null;
  }>;
  sessions?: Array<{
    date: string;
    sessionName: string;
    startTimeJst: string;
    endTimeJst: string;
    volatilityPoints: number;
    hasEvent: boolean;
    hasHighImpactEvent: boolean;
    eventsLinked: string;
  }>;
  candles?: Array<{
    datetimeJst: string;
    sessionName: string;
    openPrice: number;
    highPrice: number;
    lowPrice: number;
    closePrice: number;
  }>;
  thresholds?: Array<{
    sessionName: string;
    smallThreshold: number;
    largeThreshold: number;
  }>;
  prices?: Array<{
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }>;
  zigzagPoints?: Array<{
    timestamp: string;
    price: number;
    type: string;
  }>;
}

/**
 * DrizzleBatchRepository は、Python側からPushされた解析データを PostgreSQL に一括保存するリポジトリの実装です。
 * @responsibility: Drizzle ORM の transaction を活用し、データの一貫性を保ちながら一括保存を行う。
 */
export class DrizzleBatchRepository {
  constructor(private readonly db: DbType) {}

  /**
   * saveAll は受け取った全データをそれぞれのテーブルへUpsertします。
   */
  async saveAll(payload: SyncPayload): Promise<boolean> {
    try {
      await this.db.transaction(async (tx) => {
        // 1. Economic Events
        if (payload.events && payload.events.length > 0) {
          const values = payload.events.map(e => ({
            datetimeJst: e.datetimeJst,
            eventName: e.eventName,
            impact: e.importance,
            actual: e.actual?.toString(),
            forecast: e.forecast?.toString(),
            previous: e.previous?.toString()
          }));
          await tx.insert(economicEvents).values(values).onConflictDoNothing();
        }

        // 2. Session Volatilities
        if (payload.sessions && payload.sessions.length > 0) {
          const values = payload.sessions.map(s => ({
            date: s.date,
            sessionName: s.sessionName,
            startTimeJst: s.startTimeJst,
            endTimeJst: s.endTimeJst,
            volatilityPoints: s.volatilityPoints,
            hasEvent: s.hasEvent,
            hasHighImpactEvent: s.hasHighImpactEvent,
            eventsLinked: s.eventsLinked
          }));
          await tx.insert(sessionVolatilities)
            .values(values)
            .onConflictDoUpdate({
              target: [sessionVolatilities.date, sessionVolatilities.sessionName],
              set: {
                volatilityPoints: sql`EXCLUDED.volatility_points`,
                hasEvent: sql`EXCLUDED.has_event`,
                hasHighImpactEvent: sql`EXCLUDED.has_high_impact_event`,
                eventsLinked: sql`EXCLUDED.events_linked`
              }
            });
        }

        // 3. Price Candles
        if (payload.candles && payload.candles.length > 0) {
          const values = payload.candles.map(c => ({
            datetimeJst: c.datetimeJst,
            sessionName: c.sessionName,
            openPrice: c.openPrice,
            highPrice: c.highPrice,
            lowPrice: c.lowPrice,
            closePrice: c.closePrice
          }));
          await tx.insert(priceCandles).values(values).onConflictDoNothing();
        }

        // 4. Thresholds
        if (payload.thresholds && payload.thresholds.length > 0) {
          const values = payload.thresholds.map(t => ({
            sessionName: t.sessionName,
            smallThreshold: t.smallThreshold,
            largeThreshold: t.largeThreshold
          }));
          await tx.insert(sessionThresholds)
            .values(values)
            .onConflictDoUpdate({
              target: [sessionThresholds.sessionName],
              set: {
                smallThreshold: sql`EXCLUDED.small_threshold`,
                largeThreshold: sql`EXCLUDED.large_threshold`
              }
            });
        }

        // 5. Raw Prices (1分足)
        if (payload.prices && payload.prices.length > 0) {
          const values = payload.prices.map(p => ({
            timestamp: p.timestamp,
            open: p.open,
            high: p.high,
            low: p.low,
            close: p.close
          }));
          await tx.insert(prices).values(values).onConflictDoNothing();
        }

        // 6. ZigZag Points
        if (payload.zigzagPoints && payload.zigzagPoints.length > 0) {
          const values = payload.zigzagPoints.map(z => ({
            timestamp: z.timestamp,
            price: z.price,
            type: z.type
          }));
          await tx.insert(zigzagPoints)
            .values(values)
            .onConflictDoUpdate({
              target: [zigzagPoints.timestamp],
              set: {
                price: sql`EXCLUDED.price`,
                type: sql`EXCLUDED.type`
              }
            });
        }
      });
      return true;
    } catch (error) {
      console.error('Batch save failed:', error);
      return false;
    }
  }
}
