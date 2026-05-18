import { z } from '@hono/zod-openapi';

/**
 * ResearchNoteSchema はリサーチメモのドメインスキーマです。
 * @responsibility: 指標前後の気づきや戦略メモの識別情報・本文・作成日時を保持する。
 */
export const ResearchNoteSchema = z.object({
  id: z.string().uuid().openapi({ example: 'c1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'メモID' }),
  title: z.string().min(1).max(200).openapi({ example: 'CPI発表前の観察メモ', description: 'メモタイトル' }),
  body: z.string().min(1).max(5000).openapi({ example: '発表前はNY序盤の押し目を待つ。', description: 'メモ本文' }),
  createdAt: z.string().datetime().openapi({ example: '2026-04-01T12:00:00.000Z', description: '作成日時（ISO 8601）' }),
  updatedAt: z.string().datetime().openapi({ example: '2026-04-01T12:00:00.000Z', description: '更新日時（ISO 8601）' }),
}).openapi('ResearchNote');

export type ResearchNote = z.infer<typeof ResearchNoteSchema>;

/**
 * CreateResearchNoteInputSchema はリサーチメモ作成時のバリデーションスキーマです。
 * @responsibility: タイトル・本文の必須入力と最大文字数を検証する。
 */
export const CreateResearchNoteInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'タイトルは1文字以上で入力してください')
    .max(200, 'タイトルは200文字以内で入力してください')
    .openapi({ example: 'CPI発表前の観察メモ', description: 'メモタイトル' }),
  body: z
    .string()
    .trim()
    .min(1, '本文は1文字以上で入力してください')
    .max(5000, '本文は5000文字以内で入力してください')
    .openapi({ example: '発表前はNY序盤の押し目を待つ。', description: 'メモ本文' }),
}).openapi('CreateResearchNoteInput');

export type CreateResearchNoteInput = z.infer<typeof CreateResearchNoteInputSchema>;

/**
 * UpdateResearchNoteInputSchema はリサーチメモ更新時のバリデーションスキーマです。
 * @responsibility: 編集フォームから送られるタイトル・本文の必須入力と最大文字数を検証する。
 */
export const UpdateResearchNoteInputSchema = CreateResearchNoteInputSchema.openapi('UpdateResearchNoteInput');

export type UpdateResearchNoteInput = z.infer<typeof UpdateResearchNoteInputSchema>;
