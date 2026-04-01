import { expect, describe, it, mock, beforeEach } from 'bun:test';
import { GetRecentEventNamesUseCase } from '../getRecentEventNamesUseCase';
import { SessionRepositoryPort } from '../../port/sessionRepositoryPort';

describe('GetRecentEventNamesUseCase', () => {
  const mockSessionRepo = {
    findPreviousEvent: mock(),
    getCandles: mock(),
    getThresholds: mock(),
    getEventStats: mock(),
    findRecentSessions: mock(),
    getRecentEventNames: mock(),
  };

  const useCase = new GetRecentEventNamesUseCase(mockSessionRepo as unknown as SessionRepositoryPort);

  beforeEach(() => {
    mockSessionRepo.getRecentEventNames.mockClear();
  });

  it('リポジトリから直近の指標名リストを取得して返却すること', async () => {
    /* ## Arrange ## */
    const mockNames = ['[USD] CPI', '[USD] 雇用統計'];
    mockSessionRepo.getRecentEventNames.mockResolvedValue(mockNames);

    /* ## Act ## */
    const result = await useCase.execute(30);

    /* ## Assert ## */
    expect(mockSessionRepo.getRecentEventNames).toHaveBeenCalledWith(30);
    expect(result).toEqual(mockNames);
  });

  it('デフォルトのlimitが30として渡されること', async () => {
    /* ## Arrange ## */
    mockSessionRepo.getRecentEventNames.mockResolvedValue([]);

    /* ## Act ## */
    await useCase.execute();

    /* ## Assert ## */
    expect(mockSessionRepo.getRecentEventNames).toHaveBeenCalledWith(30);
  });
});
