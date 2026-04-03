import { expect, describe, it, mock } from 'bun:test';
import { HttpAnalyticsService } from '../analyticsServiceImpl';

describe('HttpAnalyticsService', () => {

  const baseUrl = 'http://mock-service';

  describe('calculateZigZag', () => {
    it('Python エンジンにリクエストを送り、レスポンスをドメインモデルに変換すること', async () => {
      // ## Arrange ##
      const originalFetch = globalThis.fetch;
      const mockPoints = [
        { timestamp: '2026-04-03T12:00:00Z', price: 2000.5, type: 'High' },
        { timestamp: '2026-04-03T12:05:00Z', price: 1995.0, type: 'Low' }
      ];
      
      globalThis.fetch = mock(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ points: mockPoints })
      })) as unknown as typeof globalThis.fetch;

      const service = new HttpAnalyticsService(baseUrl);
      const prices = [
        { timestamp: '2026-04-03T12:00:00Z', open: 2000, high: 2005, low: 1995, close: 2000 }
      ];

      // ## Act ##
      const result = await service.calculateZigZag(prices);

      // ## Assert ##
      expect(globalThis.fetch).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('high'); // 小文字に変換されていること
      expect(result[1].type).toBe('low');

      globalThis.fetch = originalFetch;
    });

    it('サービスがエラーを返した場合、例外を投げること', async () => {
      // ## Arrange ##
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(() => Promise.resolve({
        ok: false,
        statusText: 'Internal Server Error'
      })) as unknown as typeof globalThis.fetch;

      const service = new HttpAnalyticsService(baseUrl);

      // ## Act & Assert ##
      expect(service.calculateZigZag([])).rejects.toThrow('Analytics Service Error: Internal Server Error');

      globalThis.fetch = originalFetch;
    });
  });
});
