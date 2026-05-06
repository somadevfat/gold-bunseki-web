import type {
  AppClient,
  Candle,
  CommunityThread,
  CommunityThreadsResponse,
  CreateCommunityThreadInput,
  IndicatorsResponse,
  ReplayDataResponse,
  SessionsResponse,
} from './client';

type ApiResponse<T> = {
  ok: boolean;
  json: () => Promise<T>;
};

type ApiOptions = {
  init?: RequestInit;
};

const mockThreads: CommunityThread[] = [
  {
    id: 'mock-thread-cpi',
    title: 'CPI発表前後のXAUUSDの値幅をどう見ていますか？',
    body: '前回CPIでは発表直後の初動より、NY後半の戻りが大きかったです。',
    category: '経済指標',
    replyCount: 12,
    createdAt: '2026-05-01T12:00:00.000Z',
  },
  {
    id: 'mock-thread-london',
    title: 'ロンドン時間の初動で見るべきポイント',
    body: '欧州勢参加後の高値更新と押し戻しの深さを比較しています。',
    category: '値動き分析',
    replyCount: 5,
    createdAt: '2026-05-02T09:30:00.000Z',
  },
];

const mockCandles: Candle[] = [
  { datetimeJst: '2026-04-10T21:30:00.000Z', open: 2320.1, high: 2331.4, low: 2314.8, close: 2328.2 },
  { datetimeJst: '2026-04-10T21:31:00.000Z', open: 2328.2, high: 2336.5, low: 2322.7, close: 2332.9 },
  { datetimeJst: '2026-04-10T21:32:00.000Z', open: 2332.9, high: 2334.2, low: 2324.3, close: 2326.4 },
];

function createResponse<T>(body: T, ok = true): ApiResponse<T> {
  return {
    ok,
    json: async () => body,
  };
}

function getScenario(options?: ApiOptions): string | undefined {
  const headerScenario = getHeaderValue(options?.init?.headers, 'x-test-scenario');
  return headerScenario ?? process.env.NEXT_PUBLIC_MOCK_API_SCENARIO;
}

function getHeaderValue(headers: HeadersInit | undefined, name: string): string | undefined {
  if (!headers) {
    return undefined;
  }

  if (headers instanceof Headers) {
    return headers.get(name) ?? undefined;
  }

  if (Array.isArray(headers)) {
    const entry = headers.find(([key]) => key.toLowerCase() === name.toLowerCase());
    return entry?.[1];
  }

  const value = headers[name] ?? headers[name.toLowerCase()];
  return Array.isArray(value) ? value.join(',') : value;
}

function shouldFail(options?: ApiOptions): boolean {
  return getScenario(options) === 'error';
}

function shouldReturnEmpty(options?: ApiOptions): boolean {
  return getScenario(options) === 'empty';
}

export function createMockApiClient(): AppClient {
  return {
    api: {
      v1: {
        market: {
          indicators: {
            $get: async (_args, options) => {
              if (shouldFail(options)) {
                return createResponse<IndicatorsResponse>({ indicators: [] }, false);
              }

              return createResponse<IndicatorsResponse>({
                indicators: shouldReturnEmpty(options)
                  ? []
                  : ['[USD] CPI', '[USD] ISM製造業PMI', '[USD] 雇用統計'],
              });
            },
          },
          replay: {
            $get: async (args, options) => {
              if (shouldFail(options)) {
                return createResponse<ReplayDataResponse>({
                  previousEvent: null,
                  candles: [],
                  historicalStats: [],
                }, false);
              }

              return createResponse<ReplayDataResponse>({
                previousEvent: shouldReturnEmpty(options)
                  ? null
                  : {
                    date: '2026-04-10',
                    sessionName: 'NY_Open',
                    volatilityPoints: 128.4,
                    eventsLinked: args.query.event,
                    condition: 'Large',
                    exactEventTimeJst: '2026-04-10T21:30:00.000Z',
                  },
                candles: shouldReturnEmpty(options) ? [] : mockCandles,
                historicalStats: shouldReturnEmpty(options)
                  ? []
                  : [
                    {
                      eventName: args.query.event,
                      condition: 'Large',
                      averageVola: 121.8,
                      count: 8,
                    },
                  ],
              });
            },
          },
          sessions: {
            $get: async (args, options) => {
              if (shouldFail(options)) {
                return createResponse<SessionsResponse>({
                  sessions: [],
                  currentCondition: 'Unknown',
                }, false);
              }

              const limit = Number.parseInt(args.query.limit, 10);
              const sessions = [
                {
                  id: 1,
                  date: '2026-05-01T00:00:00.000Z',
                  sessionName: 'NY_Open',
                  startTimeJst: '21:30',
                  endTimeJst: '23:30',
                  volatilityPoints: 128.4,
                  hasEvent: true,
                  hasHighImpactEvent: true,
                  eventsLinked: 'CPI,Core CPI',
                  condition: 'Large',
                },
                {
                  id: 2,
                  date: '2026-05-02T00:00:00.000Z',
                  sessionName: 'London_Open',
                  startTimeJst: '16:00',
                  endTimeJst: '18:00',
                  volatilityPoints: 72.6,
                  hasEvent: false,
                  hasHighImpactEvent: false,
                  eventsLinked: '',
                  condition: 'Mid',
                },
              ];

              return createResponse<SessionsResponse>({
                sessions: shouldReturnEmpty(options) ? [] : sessions.slice(0, limit),
                currentCondition: shouldReturnEmpty(options) ? 'Small' : 'Large',
              });
            },
          },
        },
        community: {
          threads: {
            $get: async (_args, options) => {
              if (shouldFail(options)) {
                return createResponse<CommunityThreadsResponse>({ threads: [] }, false);
              }

              return createResponse<CommunityThreadsResponse>({
                threads: shouldReturnEmpty(options) ? [] : mockThreads,
              });
            },
            $post: async (args, options) => {
              if (shouldFail(options)) {
                return createResponse<CommunityThread>(createCommunityThread(args.json), false);
              }

              return createResponse<CommunityThread>(createCommunityThread(args.json));
            },
          },
        },
      },
    },
  };
}

function createCommunityThread(input: CreateCommunityThreadInput): CommunityThread {
  return {
    id: 'mock-thread-new',
    title: input.title,
    body: input.body,
    category: input.category ?? 'Market Discussion',
    replyCount: 0,
    createdAt: '2026-05-06T00:00:00.000Z',
  };
}
