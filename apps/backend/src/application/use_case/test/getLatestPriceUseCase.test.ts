import { expect, describe, it, mock, beforeEach } from 'bun:test';
import { GetLatestPriceUseCase } from '../getLatestPriceUseCase';
import { PriceRepositoryPort } from '../../port/priceRepositoryPort';

describe('GetLatestPriceUseCase', () => {
  const mockPriceRepo = {
    getLatestPrice: mock(),
    getRecentPrices: mock(),
  };

  const useCase = new GetLatestPriceUseCase(mockPriceRepo as unknown as PriceRepositoryPort);

  beforeEach(() => {
    mockPriceRepo.getLatestPrice.mockClear();
  });

  it('リポジトリから最新価格を取得して返却すること', async () => {
    /* ## Arrange ## */
    const mockPrice = { timestamp: '2026-04-01T10:00:00Z', open: 100, high: 110, low: 90, close: 105 };
    mockPriceRepo.getLatestPrice.mockResolvedValue(mockPrice);

    /* ## Act ## */
    const result = await useCase.execute();

    /* ## Assert ## */
    expect(mockPriceRepo.getLatestPrice).toHaveBeenCalled();
    expect(result).toEqual(mockPrice);
  });

  it('データが存在しない場合、null を返却すること', async () => {
    /* ## Arrange ## */
    mockPriceRepo.getLatestPrice.mockResolvedValue(null);

    /* ## Act ## */
    const result = await useCase.execute();

    /* ## Assert ## */
    expect(result).toBeNull();
  });
});
