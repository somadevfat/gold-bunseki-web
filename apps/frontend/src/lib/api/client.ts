import { hc } from 'hono/client';
import type { AppType } from 'backend/src/index';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

/**
 * apiClient はバックエンド API を呼び出すための RPC クライアントです。
 * 
 * NOTE: 
 * TypeScript がパッケージ境界を越えた複雑なジェネリクスを正しく推論できず 'unknown' になる場合があるため、
 * ここでは意図的に any を使用しつつ、利用箇所でレスポンス型（ReplayDataResponse等）を適用して安全性を確保します。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiClient = hc<AppType>(baseUrl) as any;

/* --- レスポンス型の定義 (バックエンドの型から推論) --- */

export type ReplayDataResponse = {
  previousEvent: {
    date: string;
    sessionName: string;
    volatilityPoints: number;
    eventsLinked: string;
    condition: 'Large' | 'Mid' | 'Small';
    exactEventTimeJst?: string;
  } | null;
  candles: Candle[];
  historicalStats: {
    eventName: string;
    condition: string;
    averageVola: number;
    count: number;
  }[];
};

export type SessionsResponse = {
  sessions: {
    id: number;
    date: string;
    sessionName: string;
    startTimeJst: string;
    endTimeJst: string;
    volatilityPoints: number;
    hasEvent: boolean;
    hasHighImpactEvent: boolean;
    eventsLinked: string;
    condition: string;
  }[];
  currentCondition: string;
};

export type Candle = {
  datetimeJst: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type SessionVolatility = SessionsResponse['sessions'][number];
