import { expect, describe, it, mock } from 'bun:test';
import { D1ZigZagRepository } from '../d1ZigZagRepository';

interface MockD1Database extends D1Database {
  _bindMock: ReturnType<typeof mock>;
  _prepareMock: ReturnType<typeof mock>;
  _batchMock: ReturnType<typeof mock>;
}

describe('D1ZigZagRepository', () => {

  const createMockD1 = () => {
    const bindMock = mock(() => ({}));
    const prepareMock = mock(() => ({
      bind: bindMock
    }));
    const batchMock = mock(() => Promise.resolve());

    return {
      prepare: prepareMock,
      batch: batchMock,
      _bindMock: bindMock,
      _prepareMock: prepareMock,
      _batchMock: batchMock
    } as unknown as MockD1Database;
  };

  describe('savePoints', () => {
    it('頂点データが空の場合は何もしないこと', async () => {
      const mockDb = createMockD1();
      const repo = new D1ZigZagRepository(mockDb);

      await repo.savePoints([]);

      expect(mockDb._prepareMock).not.toHaveBeenCalled();
      expect(mockDb._batchMock).not.toHaveBeenCalled();
    });

    it('頂点データがある場合、バッチ処理で保存を実行すること', async () => {
      const mockDb = createMockD1();
      const repo = new D1ZigZagRepository(mockDb);
      const points = [
        { timestamp: '2026-04-03T12:00:00Z', price: 2000, type: 'High' as const },
        { timestamp: '2026-04-03T12:10:00Z', price: 1990, type: 'Low' as const }
      ];

      await repo.savePoints(points);

      expect(mockDb._prepareMock).toHaveBeenCalledWith(expect.stringContaining('INSERT OR IGNORE INTO zigzag_points'));
      expect(mockDb._bindMock).toHaveBeenCalledTimes(2);
      expect(mockDb._batchMock).toHaveBeenCalled();
    });
  });
});
