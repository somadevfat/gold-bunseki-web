import { expect, describe, it, mock, beforeEach } from 'bun:test';
import { AppContainer } from '../../../app/container';
import { ResearchNote } from '../../../domain/entities/researchNote';
import { createMockContext } from '../../test/testHelpers';
import { createResearchNoteController } from '../researchNoteController';

interface MockResponse {
  body: Record<string, unknown> & {
    notes?: ResearchNote[];
    id?: string;
    title?: string;
    success?: boolean;
  };
  status: number;
}

const mockNote: ResearchNote = {
  id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'CPI発表前の観察メモ',
  body: '発表前はNY序盤の押し目を待つ。',
  createdAt: '2026-04-01T12:00:00.000Z',
  updatedAt: '2026-04-01T12:00:00.000Z',
};

/**
 * ResearchNoteController Unit Tests
 * @responsibility: リサーチメモの一覧取得・作成APIの正常系・異常系を検証する。
 */
describe('ResearchNoteController', () => {
  let container: AppContainer;
  let getNotesExecute: ReturnType<typeof mock>;
  let createNoteExecute: ReturnType<typeof mock>;
  let updateNoteExecute: ReturnType<typeof mock>;
  let deleteNoteExecute: ReturnType<typeof mock>;

  beforeEach(() => {
    getNotesExecute = mock(() => Promise.resolve([mockNote]));
    createNoteExecute = mock(() => Promise.resolve(mockNote));
    updateNoteExecute = mock(() => Promise.resolve(mockNote));
    deleteNoteExecute = mock(() => Promise.resolve(true));
    container = {
      useCases: {
        researchNotes: {
          getNotes: { execute: getNotesExecute },
          createNote: { execute: createNoteExecute },
          updateNote: { execute: updateNoteExecute },
          deleteNote: { execute: deleteNoteExecute },
        },
      },
    } as unknown as AppContainer;
  });

  describe('getNotes', () => {
    it('保存済みメモ一覧を取得して 200 を返すこと', async () => {
      // ## Arrange ##
      const controller = createResearchNoteController(container);
      const c = createMockContext({});

      // ## Act ##
      const res = (await controller.getNotes(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(200);
      expect(res.body.notes).toHaveLength(1);
      expect(res.body.notes?.[0].id).toBe(mockNote.id);
      expect(getNotesExecute).toHaveBeenCalledTimes(1);
    });

    it('保存済みメモが存在しない場合、空の notes 配列と 200 を返すこと', async () => {
      // ## Arrange ##
      getNotesExecute = mock(() => Promise.resolve([]));
      container.useCases.researchNotes.getNotes.execute = getNotesExecute;
      const controller = createResearchNoteController(container);
      const c = createMockContext({});

      // ## Act ##
      const res = (await controller.getNotes(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(200);
      expect(res.body.notes).toEqual([]);
    });

    it('ユースケースがエラーをスローした場合、グローバルエラーハンドラーへ委譲すること', async () => {
      // ## Arrange ##
      getNotesExecute = mock(() => Promise.reject(new Error('DB接続エラー')));
      container.useCases.researchNotes.getNotes.execute = getNotesExecute;
      const controller = createResearchNoteController(container);
      const c = createMockContext({});

      // ## Act & Assert ##
      await expect(controller.getNotes(c)).rejects.toThrow('DB接続エラー');
    });
  });

  describe('createNote', () => {
    it('有効な入力でリサーチメモを作成して 201 を返すこと', async () => {
      // ## Arrange ##
      const body = {
        title: mockNote.title,
        body: mockNote.body,
      };
      const controller = createResearchNoteController(container);
      const c = createMockContext({}, {}, {}, body);

      // ## Act ##
      const res = (await controller.createNote(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(201);
      expect(res.body.id).toBe(mockNote.id);
      expect(res.body.title).toBe(mockNote.title);
      expect(createNoteExecute).toHaveBeenCalledWith(body);
    });

    it('ユースケースがエラーをスローした場合、グローバルエラーハンドラーへ委譲すること', async () => {
      // ## Arrange ##
      createNoteExecute = mock(() => Promise.reject(new Error('INSERT失敗')));
      container.useCases.researchNotes.createNote.execute = createNoteExecute;
      const controller = createResearchNoteController(container);
      const c = createMockContext({}, {}, {}, {
        title: mockNote.title,
        body: mockNote.body,
      });

      // ## Act & Assert ##
      await expect(controller.createNote(c)).rejects.toThrow('INSERT失敗');
    });
  });

  describe('updateNote', () => {
    it('有効な入力でリサーチメモを更新して 200 を返すこと', async () => {
      // ## Arrange ##
      const body = {
        title: 'CPI発表後の観察メモ',
        body: '初動とNY後半の戻りを比較する。',
      };
      const controller = createResearchNoteController(container);
      const c = createMockContext({}, {}, { noteId: mockNote.id }, body);

      // ## Act ##
      const res = (await controller.updateNote(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(mockNote.id);
      expect(updateNoteExecute).toHaveBeenCalledWith(mockNote.id, body);
    });

    it('対象メモが存在しない場合 404 を返すこと', async () => {
      // ## Arrange ##
      updateNoteExecute = mock(() => Promise.resolve(null));
      container.useCases.researchNotes.updateNote.execute = updateNoteExecute;
      const controller = createResearchNoteController(container);
      const c = createMockContext({}, {}, { noteId: mockNote.id }, {
        title: mockNote.title,
        body: mockNote.body,
      });

      // ## Act ##
      const res = (await controller.updateNote(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(404);
    });
  });

  describe('deleteNote', () => {
    it('対象メモを削除して 200 を返すこと', async () => {
      // ## Arrange ##
      const controller = createResearchNoteController(container);
      const c = createMockContext({}, {}, { noteId: mockNote.id });

      // ## Act ##
      const res = (await controller.deleteNote(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(deleteNoteExecute).toHaveBeenCalledWith(mockNote.id);
    });

    it('対象メモが存在しない場合 404 を返すこと', async () => {
      // ## Arrange ##
      deleteNoteExecute = mock(() => Promise.resolve(false));
      container.useCases.researchNotes.deleteNote.execute = deleteNoteExecute;
      const controller = createResearchNoteController(container);
      const c = createMockContext({}, {}, { noteId: mockNote.id });

      // ## Act ##
      const res = (await controller.deleteNote(c)) as unknown as MockResponse;

      // ## Assert ##
      expect(res.status).toBe(404);
    });
  });
});
