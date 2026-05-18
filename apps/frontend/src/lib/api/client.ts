import { hc } from 'hono/client';
import type { AppType } from 'backend/src/index';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
          ":threadId": {
            $get: (args: { param: { threadId: string } }, options?: { init?: RequestInit }) => Promise<{ ok: boolean; json: () => Promise<CommunityThreadDetailResponse> }>;
            replies: {
              $post: (args: { param: { threadId: string }; json: CreateCommunityReplyInput }, options?: { init?: RequestInit }) => Promise<{ ok: boolean; json: () => Promise<CommunityReply> }>;
            };
          };
        };
      };
      "research-notes": {
        $get: (args?: Record<string, never>, options?: { init?: RequestInit }) => Promise<{ ok: boolean; json: () => Promise<ResearchNotesResponse> }>;
        $post: (args: { json: CreateResearchNoteInput }, options?: { init?: RequestInit }) => Promise<{ ok: boolean; json: () => Promise<ResearchNote> }>;
      };
      sync: {
        status: { $get: (args?: Record<string, never>, options?: { init?: RequestInit }) => Promise<{ ok: boolean; json: () => Promise<SyncStatusResponse> }> };
      }
    }
  }
};

/**
 * apiClient はバックエンド API を呼び出すための RPC クライアントです。
 */
export const apiClient = hc<AppType>(baseUrl) as unknown as AppClient;

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

export type CommunityReply = {
  id: string;
  threadId: string;
  body: string;
  createdAt: string;
};

export type CommunityThreadsResponse = {
  threads: CommunityThread[];
};

export type CommunityThreadDetailResponse = {
  thread: CommunityThread;
  replies: CommunityReply[];
};

export type ResearchNote = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type ResearchNotesResponse = {
  notes: ResearchNote[];
};

export type SyncStatusResponse = {
  lastCandleAt: string;
  lastSessionAt: string;
  lastEventAt: string;
  totalCandles: number;
  syncHealth: string;
};

export type CreateCommunityThreadInput = {
  title: string;
  body: string;
  category?: string;
};

export type CreateCommunityReplyInput = {
  body: string;
};

export type CreateResearchNoteInput = {
  title: string;
  body: string;
};

export type Candle = {
  datetimeJst: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type SessionVolatility = SessionsResponse['sessions'][number];
