import { Context } from 'hono';
import { Bindings, AppVariables } from '../types';
import { GetLatestPriceUseCase } from '../../application/use_case/getLatestPriceUseCase';
import { CalculateZigZagUseCase } from '../../application/use_case/calculateZigZagUseCase';
import { GetRecentSessionsUseCase } from '../../application/use_case/getRecentSessionsUseCase';
import { GetReplayDataUseCase } from '../../application/use_case/getReplayDataUseCase';
import { GetRecentEventNamesUseCase } from '../../application/use_case/getRecentEventNamesUseCase';
import { SyncPayload } from '../../infrastructure/repository/drizzleBatchRepository';

/**
 * MarketController はマーケットデータ（価格、ZigZag、セッション）に関するリクエストを処理します。
 */
export class MarketController {
  /**
   * 指標一覧の取得
   */
  static async getIndicators(c: Context<{ Bindings: Bindings; Variables: AppVariables }>) {
    try {
      const useCase = new GetRecentEventNamesUseCase(c.get('sessionRepo'));
      const indicators = await useCase.execute(50);
      return c.json({ indicators }, 200);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("[Indicators Error]", error.message);
      return c.json({ indicators: [] }, 500);
    }
  }

  /**
   * 最新価格の取得
   */
  static async getLatestPrice(c: Context<{ Bindings: Bindings; Variables: AppVariables }>) {
    const useCase = new GetLatestPriceUseCase(c.get('priceRepo'));
    const price = await useCase.execute();
    return c.json(price, 200);
  }

  /**
   * ZigZagの計算
   */
  static async calculateZigZag(c: Context<{ Bindings: Bindings; Variables: AppVariables }>) {
    try {
      const useCase = new CalculateZigZagUseCase(
        c.get('priceRepo'),
        c.get('analyticsService'),
        c.get('zigzagRepo')
      );
      const points = await useCase.execute();
      return c.json({ message: 'ZigZag calculate success', points }, 200);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("[ZigZag Error]", error.message);
      return c.json({ message: 'Error calculating ZigZag', points: [] }, 500);
    }
  }

  /**
   * 最近のセッション情報取得
   */
  static async getRecentSessions(c: Context<{ Bindings: Bindings; Variables: AppVariables }>) {
    try {
      const { limit } = c.req.valid('query' as never) as { limit: string };
      const count = parseInt(limit || '10', 10);
      
      const useCase = new GetRecentSessionsUseCase(c.get('sessionRepo'));
      let sessions = await useCase.execute(count);

      if (sessions.length === 0) {
        const analyticsUrl = c.env.ANALYTICS_SERVICE_URL || 'http://127.0.0.1:8000';
        console.log("[Auto-Sync] Database is empty. Triggering automatic sync...");
        try {
          const response = await fetch(`${analyticsUrl}/analyze/sync`, { method: 'POST' });
          if (response.ok) {
            const payload = await response.json() as SyncPayload;
            await c.get('batchRepo').saveAll(payload);
            sessions = await useCase.execute(count);
          }
        } catch (syncErr: unknown) {
          const error = syncErr instanceof Error ? syncErr : new Error(String(syncErr));
          console.warn("[Auto-Sync Failed]", error.message);
        }
      }

      return c.json({
        sessions,
        currentCondition: sessions.length > 0 ? sessions[0].condition : 'Small'
      }, 200);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("[Sessions Error]", error.message);
      return c.json({ sessions: [], currentCondition: 'Unknown' }, 200); 
    }
  }

  /**
   * 再現データの取得
   */
  static async getEventReplay(c: Context<{ Bindings: Bindings; Variables: AppVariables }>) {
    try {
      const { event } = c.req.valid('query' as never) as { event: string };
      if (!event) return c.json({ error: 'event is required' }, 400);

      const useCase = new GetReplayDataUseCase(c.get('sessionRepo'));
      const data = await useCase.execute(event);
      return c.json(data, 200);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("[Replay Error]", error.message);
      return c.json({ previousEvent: null, sessionStats: [], replayCandles: [] }, 200);
    }
  }
}
