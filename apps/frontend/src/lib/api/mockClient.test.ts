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

  it('error シナリオでは失敗レスポンスを返すこと', async () => {
    /* ## Arrange ## */
    const client = createMockApiClient();
    process.env.NEXT_PUBLIC_MOCK_API_SCENARIO = 'error';

    /* ## Act ## */
    const response = await client.api.v1.market.indicators.$get();

    /* ## Assert ## */
    expect(response.ok).toBe(false);
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
});
