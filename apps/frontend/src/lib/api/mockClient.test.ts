import { afterEach, describe, expect, it } from 'bun:test';
import { createMockApiClient } from './mockClient';

describe('createMockApiClient', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_MOCK_API_SCENARIO;
  });

  it('通常シナリオでは掲示板投稿一覧を返すこと', async () => {
    /* ## Arrange ## */
    const client = createMockApiClient();

    /* ## Act ## */
    const response = await client.api.v1.community.threads.$get();
    const body = await response.json();

    /* ## Assert ## */
    expect(response.ok).toBe(true);
    expect(body.threads.length).toBeGreaterThan(0);
    expect(body.threads[0].body).toBeTruthy();
  });

  it('empty シナリオでは空の掲示板投稿一覧を返すこと', async () => {
    /* ## Arrange ## */
    const client = createMockApiClient();

    /* ## Act ## */
    const response = await client.api.v1.community.threads.$get(undefined, {
      init: {
        headers: {
          'x-test-scenario': 'empty',
        },
      },
    });
    const body = await response.json();

    /* ## Assert ## */
    expect(response.ok).toBe(true);
    expect(body.threads).toEqual([]);
  });

  it('Headers オブジェクトのシナリオ指定では空の指標一覧を返すこと', async () => {
    /* ## Arrange ## */
    const client = createMockApiClient();

    /* ## Act ## */
    const response = await client.api.v1.market.indicators.$get(undefined, {
      init: {
        headers: new Headers([['X-Test-Scenario', 'empty']]),
      },
    });
    const body = await response.json();

    /* ## Assert ## */
    expect(response.ok).toBe(true);
    expect(body.indicators).toEqual([]);
  });

  it('配列形式ヘッダーのシナリオ指定では空の再現データを返すこと', async () => {
    /* ## Arrange ## */
    const client = createMockApiClient();

    /* ## Act ## */
    const response = await client.api.v1.market.replay.$get({ query: { event: '[USD] CPI' } }, {
      init: {
        headers: [['X-Test-Scenario', 'empty']],
      },
    });
    const body = await response.json();

    /* ## Assert ## */
    expect(response.ok).toBe(true);
    expect(body.previousEvent).toBeNull();
    expect(body.candles).toEqual([]);
    expect(body.historicalStats).toEqual([]);
  });

  it('オブジェクト形式ヘッダーは大文字小文字を区別せずにシナリオを判定すること', async () => {
    /* ## Arrange ## */
    const client = createMockApiClient();

    /* ## Act ## */
    const response = await client.api.v1.community.threads.$get(undefined, {
      init: {
        headers: {
          'X-Test-Scenario': 'empty',
        },
      },
    });
    const body = await response.json();

    /* ## Assert ## */
    expect(response.ok).toBe(true);
    expect(body.threads).toEqual([]);
  });

  it('配列値のオブジェクト形式ヘッダーでは値を結合してシナリオを判定すること', async () => {
    /* ## Arrange ## */
    const client = createMockApiClient();

    /* ## Act ## */
    const response = await client.api.v1.market.indicators.$get(undefined, {
      init: {
        headers: {
          'X-Test-Scenario': ['empty'],
        } as unknown as HeadersInit,
      },
    });
    const body = await response.json();

    /* ## Assert ## */
    expect(response.ok).toBe(true);
    expect(body.indicators).toEqual([]);
  });

  it('error シナリオでは失敗レスポンスを返すこと', async () => {
    /* ## Arrange ## */
    const client = createMockApiClient();
    process.env.NEXT_PUBLIC_MOCK_API_SCENARIO = 'error';

    /* ## Act ## */
    const response = await client.api.v1.market.indicators.$get();
    const body = await response.json();

    /* ## Assert ## */
    expect(response.ok).toBe(false);
    expect(body.indicators).toEqual([]);
  });

  it('error シナリオでは再現データの失敗レスポンスを返すこと', async () => {
    /* ## Arrange ## */
    const client = createMockApiClient();

    /* ## Act ## */
    const response = await client.api.v1.market.replay.$get({ query: { event: '[USD] CPI' } }, {
      init: {
        headers: {
          'x-test-scenario': 'error',
        },
      },
    });
    const body = await response.json();

    /* ## Assert ## */
    expect(response.ok).toBe(false);
    expect(body.previousEvent).toBeNull();
    expect(body.candles).toEqual([]);
    expect(body.historicalStats).toEqual([]);
  });

  it('通常シナリオでは再現データを返すこと', async () => {
    /* ## Arrange ## */
    const client = createMockApiClient();

    /* ## Act ## */
    const response = await client.api.v1.market.replay.$get({ query: { event: '[USD] CPI' } });
    const body = await response.json();

    /* ## Assert ## */
    expect(response.ok).toBe(true);
    expect(body.previousEvent?.eventsLinked).toBe('[USD] CPI');
    expect(body.candles.length).toBeGreaterThan(0);
    expect(body.historicalStats[0].eventName).toBe('[USD] CPI');
  });

  it('通常シナリオでは指定件数分のマーケットセッションを返すこと', async () => {
    /* ## Arrange ## */
    const client = createMockApiClient();

    /* ## Act ## */
    const response = await client.api.v1.market.sessions.$get({ query: { limit: '1' } });
    const body = await response.json();

    /* ## Assert ## */
    expect(response.ok).toBe(true);
    expect(body.sessions).toHaveLength(1);
    expect(body.sessions[0].sessionName).toBe('NY_Open');
    expect(body.currentCondition).toBe('Large');
  });

  it('マーケットセッションの件数指定が無効な場合は全件を返すこと', async () => {
    /* ## Arrange ## */
    const client = createMockApiClient();

    /* ## Act ## */
    const response = await client.api.v1.market.sessions.$get({ query: { limit: 'invalid' } });
    const body = await response.json();

    /* ## Assert ## */
    expect(response.ok).toBe(true);
    expect(body.sessions).toHaveLength(2);
  });

  it('error シナリオではマーケットセッションの失敗レスポンスを返すこと', async () => {
    /* ## Arrange ## */
    const client = createMockApiClient();

    /* ## Act ## */
    const response = await client.api.v1.market.sessions.$get({ query: { limit: '10' } }, {
      init: {
        headers: {
          'x-test-scenario': 'error',
        },
      },
    });
    const body = await response.json();

    /* ## Assert ## */
    expect(response.ok).toBe(false);
    expect(body.currentCondition).toBe('Unknown');
    expect(body.sessions).toEqual([]);
  });

  it('empty シナリオではマーケットセッションの空状態を返すこと', async () => {
    /* ## Arrange ## */
    const client = createMockApiClient();

    /* ## Act ## */
    const response = await client.api.v1.market.sessions.$get({ query: { limit: '10' } }, {
      init: {
        headers: {
          'x-test-scenario': 'empty',
        },
      },
    });
    const body = await response.json();

    /* ## Assert ## */
    expect(response.ok).toBe(true);
    expect(body.currentCondition).toBe('Small');
    expect(body.sessions).toEqual([]);
  });

  it('投稿作成では入力内容を反映した掲示板投稿を返すこと', async () => {
    /* ## Arrange ## */
    const client = createMockApiClient();

    /* ## Act ## */
    const response = await client.api.v1.community.threads.$post({
      json: {
        title: 'CPI発表後の反応確認',
        body: '初動とNY後半の戻りを比較したいです。',
        category: '経済指標',
      },
    });
    const body = await response.json();

    /* ## Assert ## */
    expect(response.ok).toBe(true);
    expect(body).toEqual({
      id: 'mock-thread-new',
      title: 'CPI発表後の反応確認',
      body: '初動とNY後半の戻りを比較したいです。',
      category: '経済指標',
      replyCount: 0,
      createdAt: '2026-05-06T00:00:00.000Z',
    });
  });

  it('error シナリオでは掲示板投稿一覧の失敗レスポンスを返すこと', async () => {
    /* ## Arrange ## */
    const client = createMockApiClient();

    /* ## Act ## */
    const response = await client.api.v1.community.threads.$get(undefined, {
      init: {
        headers: {
          'x-test-scenario': 'error',
        },
      },
    });
    const body = await response.json();

    /* ## Assert ## */
    expect(response.ok).toBe(false);
    expect(body.threads).toEqual([]);
  });

  it('error シナリオでは投稿作成の失敗レスポンスを返すこと', async () => {
    /* ## Arrange ## */
    const client = createMockApiClient();

    /* ## Act ## */
    const response = await client.api.v1.community.threads.$post({
      json: {
        title: 'NY時間の確認',
        body: '戻り幅を見たいです。',
      },
    }, {
      init: {
        headers: {
          'x-test-scenario': 'error',
        },
      },
    });
    const body = await response.json();

    /* ## Assert ## */
    expect(response.ok).toBe(false);
    expect(body.title).toBe('NY時間の確認');
    expect(body.category).toBe('Market Discussion');
  });

  it('カテゴリ未指定の投稿作成ではデフォルトカテゴリを返すこと', async () => {
    /* ## Arrange ## */
    const client = createMockApiClient();

    /* ## Act ## */
    const response = await client.api.v1.community.threads.$post({
      json: {
        title: 'ロンドン時間の確認',
        body: '直近の初動幅を見たいです。',
      },
    });
    const body = await response.json();

    /* ## Assert ## */
    expect(response.ok).toBe(true);
    expect(body.category).toBe('Market Discussion');
  });
});
