import { hc } from 'hono/client';
import type { AppType } from 'backend/src/index';
import { createMockApiClient } from './mockClient';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const mockApiMode = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
  || process.env.NEXT_PUBLIC_API_MODE === 'mock';

export type AppClient = {
  api: {
    v1: {
      market: {
        indicators: { $get: (args?: Record<string, never>, options?: { init?: RequestInit }) => Promise<{ ok: boolean; json: () => Promise<IndicatorsResponse> }> };
        replay: { $get: (args: { query: { event: string } }, options?: { init?: RequestInit }) => Promise<{ ok: boolean; json: () => Promise<ReplayDataResponse> }> };
        sessions: { $get: (args: { query: { limit: string } }, options?: { init?: RequestInit }) => Promise<{ ok: boolean; json: () => Promise<SessionsResponse> }> };
      }
      community: {
        threads: {
          $get: (args?: Record<string, never>, options?: { init?: RequestInit }) => Promise<{ ok: boolean; json: () => Promise<CommunityThreadsResponse> }>;
          $post: (args: { json: CreateCommunityThreadInput }, options?: { init?: RequestInit }) => Promise<{ ok: boolean; json: () => Promise<CommunityThread> }>;
        };
      }
    }
  }
};

/**
 * apiClient はバックエンド API を呼び出すための RPC クライアントです。
 */
export const apiClient = mockApiMode
  ? createMockApiClient()
  : hc<AppType>(baseUrl) as unknown as AppClient;

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

export type IndicatorsResponse = {
  indicators: string[];
};

export type CommunityThread = {
  id: string;
  title: string;
  category: string;
  body: string;
  replyCount: number;
  createdAt: string;
};

export type CommunityThreadsResponse = {
  threads: CommunityThread[];
};

export type CreateCommunityThreadInput = {
  title: string;
  body: string;
  category?: string;
};

export type Candle = {
  datetimeJst: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type SessionVolatility = SessionsResponse['sessions'][number];
