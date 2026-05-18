import { describe, expect, it } from 'bun:test';
import { createMockDrizzle } from '../../../interface/test/testHelpers';
import { DrizzleResearchNoteRepository } from '../drizzleResearchNoteRepository';

const createdAt = new Date('2026-04-01T12:00:00.000Z');
const updatedAt = new Date('2026-04-01T12:30:00.000Z');

const mockRow = {
  id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'CPI発表前の観察メモ',
  body: '発表前はNY序盤の押し目を待つ。',
  createdAt,
  updatedAt,
};

/**
 * DrizzleResearchNoteRepository Unit Tests
 * @responsibility: Drizzle ORM を通じたリサーチメモの作成・一覧取得を検証する。
 */
describe('DrizzleResearchNoteRepository', () => {
  describe('findAll', () => {
    it('リサーチメモを新しい順で取得し、ISO文字列へ変換して返すこと', async () => {
      // ## Arrange ##
      const mockDb = createMockDrizzle([mockRow]);
      const repo = new DrizzleResearchNoteRepository(mockDb);

      // ## Act ##
      const result = await repo.findAll(10);

      // ## Assert ##
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledTimes(1);
      expect(mockDb.orderBy).toHaveBeenCalledTimes(1);
      expect(mockDb.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual([
        {
          id: mockRow.id,
          title: mockRow.title,
          body: mockRow.body,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        },
      ]);
    });

    it('保存済みメモが存在しない場合、空配列を返すこと', async () => {
      // ## Arrange ##
      const mockDb = createMockDrizzle([]);
      const repo = new DrizzleResearchNoteRepository(mockDb);

      // ## Act ##
      const result = await repo.findAll(10);

      // ## Assert ##
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('入力値を insert して作成されたメモを返すこと', async () => {
      // ## Arrange ##
      const mockDb = createMockDrizzle([mockRow]);
      const repo = new DrizzleResearchNoteRepository(mockDb);

      // ## Act ##
      const result = await repo.create({
        title: mockRow.title,
        body: mockRow.body,
      });

      // ## Assert ##
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      expect(mockDb.values).toHaveBeenCalledWith({
        title: mockRow.title,
        body: mockRow.body,
      });
      expect(mockDb.returning).toHaveBeenCalledTimes(1);
      expect(result.id).toBe(mockRow.id);
      expect(result.updatedAt).toBe(updatedAt.toISOString());
    });
  });

  describe('update', () => {
    it('入力値で既存メモを更新し、更新されたメモを返すこと', async () => {
      // ## Arrange ##
      const mockDb = createMockDrizzle([mockRow]);
      const repo = new DrizzleResearchNoteRepository(mockDb);

      // ## Act ##
      const result = await repo.update(mockRow.id, {
        title: 'CPI発表後の観察メモ',
        body: '初動とNY後半の戻りを比較する。',
      });

      // ## Assert ##
      expect(mockDb.update).toHaveBeenCalledTimes(1);
      expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
        title: 'CPI発表後の観察メモ',
        body: '初動とNY後半の戻りを比較する。',
      }));
      expect(mockDb.where).toHaveBeenCalledTimes(1);
      expect(result?.id).toBe(mockRow.id);
    });

    it('対象メモが存在しない場合、null を返すこと', async () => {
      // ## Arrange ##
      const mockDb = createMockDrizzle([]);
      const repo = new DrizzleResearchNoteRepository(mockDb);

      // ## Act ##
      const result = await repo.update(mockRow.id, {
        title: 'CPI発表後の観察メモ',
        body: '初動とNY後半の戻りを比較する。',
      });

      // ## Assert ##
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('対象メモを削除し、削除成功を返すこと', async () => {
      // ## Arrange ##
      const mockDb = createMockDrizzle([{ id: mockRow.id }]);
      const repo = new DrizzleResearchNoteRepository(mockDb);

      // ## Act ##
      const result = await repo.delete(mockRow.id);

      // ## Assert ##
      expect(mockDb.delete).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('対象メモが存在しない場合、false を返すこと', async () => {
      // ## Arrange ##
      const mockDb = createMockDrizzle([]);
      const repo = new DrizzleResearchNoteRepository(mockDb);

      // ## Act ##
      const result = await repo.delete(mockRow.id);

      // ## Assert ##
      expect(result).toBe(false);
    });
  });
});
