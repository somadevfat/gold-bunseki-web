import { http, HttpResponse } from 'msw';

/* ユニットテスト用の MSW ハンドラー定義
 * @responsibility 各APIエンドポイントのモックレスポンスを定義し、ユニットテストの外部依存を排除する。 */

const baseUrl = '*';

export const handlers = [
  /* 同期ステータス */
  http.get(`${baseUrl}/api/v1/sync/status`, ({ request }) => {
    if (request.headers.get('x-test-scenario') === 'error') {
      return new HttpResponse(null, { status: 500 });
    }
    return HttpResponse.json({
      lastCandleAt: '2026-04-01T10:00:00Z',
      lastSessionAt: '2026-04-01',
      lastEventAt: '2026-04-01T10:00:00Z',
      totalCandles: 10000,
      syncHealth: 'Healthy',
    });
  }),

  /* セッション一覧 */
  http.get(`${baseUrl}/api/v1/market/sessions`, ({ request }) => {
    const scenario = request.headers.get('x-test-scenario');

    if (scenario === 'error') {
      return new HttpResponse(null, { status: 500 });
    }
    if (scenario === 'empty') {
      return HttpResponse.json({ sessions: [], currentCondition: 'Small' });
    }

    return HttpResponse.json({
      sessions: [
        {
          id: 1,
          date: '2026-04-01',
          sessionName: 'NY_Open',
          startTimeJst: '21:00:00',
          endTimeJst: '00:00:00',
          volatilityPoints: 120.5,
          hasEvent: true,
          hasHighImpactEvent: true,
          eventsLinked: 'CPI',
          condition: 'Large',
        },
      ],
      currentCondition: 'Large',
    });
  }),

  /* 指標一覧 */
  http.get(`${baseUrl}/api/v1/market/indicators`, () => {
    return HttpResponse.json({
      indicators: ['[USD] CPI', '[USD] 雇用統計', '[USD] ISM製造業PMI', '[EUR] 欧州中央銀行(ECB)政策金利'],
    });
  }),

  /* 再現データ */
  http.get(`${baseUrl}/api/v1/market/replay`, ({ request }) => {
    const url = new URL(request.url);
    const event = url.searchParams.get('event') || '不明';

    return HttpResponse.json({
      previousEvent: {
        date: '2026-03-01',
        sessionName: 'NY_Open',
        volatilityPoints: 150.0,
        eventsLinked: event,
        condition: 'Large',
        exactEventTimeJst: '2026-03-01T21:30:00Z',
      },
      candles: [
        { datetimeJst: '2026-03-01T21:28:00Z', open: 2000, high: 2005, low: 1995, close: 2002 },
        { datetimeJst: '2026-03-01T21:29:00Z', open: 2002, high: 2010, low: 2000, close: 2008 },
        { datetimeJst: '2026-03-01T21:30:00Z', open: 2008, high: 2050, low: 2005, close: 2045 },
      ],
      historicalStats: [
        { eventName: event, condition: 'Large', averageVola: 140.5, count: 10 },
        { eventName: event, condition: 'Mid', averageVola: 65.2, count: 5 },
        { eventName: event, condition: 'Small', averageVola: 25.1, count: 2 },
      ],
    });
  }),

  /* 掲示板投稿一覧 */
  http.get(`${baseUrl}/api/v1/community/threads`, ({ request }) => {
    const scenario = request.headers.get('x-test-scenario');

    if (scenario === 'error') {
      return new HttpResponse(null, { status: 500 });
    }
    if (scenario === 'empty') {
      return HttpResponse.json({ threads: [] });
    }

    return HttpResponse.json({
      threads: [
        {
          id: 'thread-1',
          title: 'CPI発表前後のXAUUSDの値幅をどう見ていますか？',
          category: 'Market Discussion',
          body: '前回CPIでは発表直後の初動より、NY後半の戻りが大きかったです。',
          replyCount: 12,
          createdAt: '2026-04-01T12:00:00Z',
        },
      ],
    });
  }),

  /* 掲示板投稿詳細 */
  http.get(`${baseUrl}/api/v1/community/threads/:threadId`, ({ params, request }) => {
    const scenario = request.headers.get('x-test-scenario');
    const threadId = String(params.threadId);

    if (scenario === 'error' || threadId === 'missing') {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({
      thread: {
        id: threadId,
        title: 'CPI発表前後のXAUUSDの値幅をどう見ていますか？',
        category: 'Market Discussion',
        body: '前回CPIでは発表直後の初動より、NY後半の戻りが大きかったです。',
        replyCount: 1,
        createdAt: '2026-04-01T12:00:00Z',
      },
      replies: [
        {
          id: 'reply-1',
          threadId,
          body: 'NY後半の戻りは出来高も合わせて確認したいです。',
          createdAt: '2026-04-01T12:30:00Z',
        },
      ],
    });
  }),

  /* 認証 (better-auth) - セッション取得 */
  http.post(`${baseUrl}/api/v1/community/threads`, async ({ request }) => {
    const scenario = request.headers.get('x-test-scenario');
    if (scenario === 'error') {
      return new HttpResponse(null, { status: 500 });
    }

    const body = await request.json() as { title?: string; body?: string; category?: string };
    if (!body.title || !body.body) {
      return new HttpResponse(null, { status: 400 });
    }

    return HttpResponse.json({
      id: 'thread-new',
      title: body.title,
      category: body.category || 'その他',
      body: body.body,
      replyCount: 0,
      createdAt: '2026-05-05T10:00:00Z',
    }, { status: 201 });
  }),

  /* 掲示板返信作成 */
  http.post(`${baseUrl}/api/v1/community/threads/:threadId/replies`, async ({ params, request }) => {
    const scenario = request.headers.get('x-test-scenario');
    if (scenario === 'error') {
      return new HttpResponse(null, { status: 500 });
    }

    const body = await request.json() as { body?: string };
    if (!body.body) {
      return new HttpResponse(null, { status: 400 });
    }

    return HttpResponse.json({
      id: 'reply-new',
      threadId: String(params.threadId),
      body: body.body,
      createdAt: '2026-05-05T10:30:00Z',
    }, { status: 201 });
  }),

  http.get(`${baseUrl}/api/auth/get-session`, ({ request }) => {
    const cookie = request.headers.get('cookie');
    if (cookie && cookie.includes('mock_session_token')) {
      return HttpResponse.json({
        user: {
          id: 'mock-user-id',
          name: 'Somah (Mock)',
          email: 'somah@example.com',
          image: 'https://avatars.githubusercontent.com/u/1?v=4',
          emailVerified: true,
          createdAt: '2026-04-01T00:00:00Z',
          updatedAt: '2026-04-01T00:00:00Z',
        },
        session: {
          id: 'mock-session-id',
          expiresAt: '2030-01-01T00:00:00Z',
          token: 'mock_session_token',
          createdAt: '2026-04-01T00:00:00Z',
          updatedAt: '2026-04-01T00:00:00Z',
          ipAddress: '127.0.0.1',
          userAgent: 'Playwright Mock',
          userId: 'mock-user-id',
        },
      });
    }
    /* 未ログイン状態では null を返す */
    return HttpResponse.json(null);
  }),

  /* 認証 - サインアウト */
  http.post(`${baseUrl}/api/auth/sign-out`, () => {
    return HttpResponse.json({ success: true }, {
      headers: { 'Set-Cookie': 'better-auth.session_token=; Max-Age=0; Path=/' },
    });
  }),
];
