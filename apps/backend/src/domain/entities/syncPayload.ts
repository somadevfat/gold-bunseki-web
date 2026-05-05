/**
 * Analytics / MT5 からバックエンドへ Push される一括同期用ペイロード（リポジトリ永続化の入力）。
 */
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
