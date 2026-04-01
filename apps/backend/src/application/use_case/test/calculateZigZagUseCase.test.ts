import { expect, describe, it, mock, beforeEach } from 'bun:test';
import { CalculateZigZagUseCase } from '../calculateZigZagUseCase';
import { PriceRepositoryPort } from '../../port/priceRepositoryPort';
import { AnalyticsServicePort } from '../../port/analyticsServicePort';
import { ZigZagRepositoryPort } from '../../port/zigzagRepositoryPort';
import { ZigZagPoint } from '../../../domain/entities/zigzag';

describe('CalculateZigZagUseCase', () => {
  const mockPriceRepo = {
    getRecentPrices: mock(),
    getLatestPrice: mock(),
  };

  const mockAnalyticsService = {
    calculateZigZag: mock(),
  };

  const mockZigZagRepo = {
    savePoints: mock(),
    getLatestPoints: mock(),
  };

  const useCase = new CalculateZigZagUseCase(
    mockPriceRepo as unknown as PriceRepositoryPort,
    mockAnalyticsService as unknown as AnalyticsServicePort,
    mockZigZagRepo as unknown as ZigZagRepositoryPort
  );

  beforeEach(() => {
    mockPriceRepo.getRecentPrices.mockClear();
    mockAnalyticsService.calculateZigZag.mockClear();
    mockZigZagRepo.savePoints.mockClear();
  });

  it('十分な価格データがある場合、計算を実行して結果を保存すること', async () => {
    /* ## Arrange ## */
    const mockPrices = [
      { timestamp: '2026-04-01T10:00:00Z', open: 100, high: 110, low: 90, close: 105 },
      { timestamp: '2026-04-01T10:01:00Z', open: 105, high: 115, low: 100, close: 110 },
    ];
    const mockPoints: ZigZagPoint[] = [
      { timestamp: '2026-04-01T10:00:00Z', price: 90, type: 'low' },
    ];

    mockPriceRepo.getRecentPrices.mockResolvedValue(mockPrices);
    mockAnalyticsService.calculateZigZag.mockResolvedValue(mockPoints);

    /* ## Act ## */
    const result = await useCase.execute();

    /* ## Assert ## */
    expect(mockPriceRepo.getRecentPrices).toHaveBeenCalledWith(100);
    expect(mockAnalyticsService.calculateZigZag).toHaveBeenCalledWith(mockPrices);
    expect(mockZigZagRepo.savePoints).toHaveBeenCalledWith(mockPoints);
    expect(result).toEqual(mockPoints);
  });

  it('価格データが不足している場合、空配列を返し計算を行わないこと', async () => {
    /* ## Arrange ## */
    mockPriceRepo.getRecentPrices.mockResolvedValue([{ timestamp: 'only-one' }]);

    /* ## Act ## */
    const result = await useCase.execute();

    /* ## Assert ## */
    expect(mockAnalyticsService.calculateZigZag).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
