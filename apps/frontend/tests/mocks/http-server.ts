const PORT = 8788;
process.env.NEXT_PUBLIC_API_URL = `http://localhost:${PORT}`;

import { handlers } from './handlers';

console.log(`🚀 MSW Bun Native Mock Server is starting on http://localhost:${PORT}`);

Bun.serve({
  port: PORT,
  async fetch(req) {
    // 1. CORS Preflight
    if (req.method === 'OPTIONS') {
      const origin = req.headers.get('origin') || '*';
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
        },
      });
    }

    // 2. MSW のハンドラーを順に評価してリクエストを処理する
    for (const handler of handlers) {
      try {
        const result = await handler.run({ 
          request: req,
          requestId: Math.random().toString(36).substring(7)
        });

        if (result && result.response) {
          const mswResponse = result.response;
          
          // ストリームのハングを避けるため、一旦テキストとして読み切る
          const body = await mswResponse.text();
          
          // CORSヘッダーを付与してレスポンスを作成
          const headers = new Headers(mswResponse.headers);
          const origin = req.headers.get('origin') || '*';
          headers.set('Access-Control-Allow-Origin', origin);
          headers.set('Access-Control-Allow-Credentials', 'true');
          headers.set('Content-Type', 'application/json');

          return new Response(body, {
            status: mswResponse.status,
            statusText: mswResponse.statusText,
            headers: headers,
          });
        }
      } catch (err) {
        console.error('[MSW Handler Error]', err);
      }
    }

    // 3. どのハンドラーにもマッチしなかった場合
    console.warn(`[MSW Bun Native] Unhandled request: ${req.method} ${req.url}`);
    return new Response('Not Found in MSW Mocks', { status: 404 });
  },
});
