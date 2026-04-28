import { z } from '@hono/zod-openapi';

/**
 * CommunityThreadSchema は掲示板スレッドのドメインスキーマです。
 * @responsibility: スレッドの識別情報・内容・カテゴリ・返信数・作成日時を保持する。
 */
export const CommunityThreadSchema = z.object({
  id: z.string().uuid().openapi({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'スレッドID' }),
  title: z.string().min(1).max(200).openapi({ example: 'CPI発表前後のXAUUSDの値幅について', description: 'スレッドタイトル' }),
  body: z.string().min(1).max(5000).openapi({ example: '前回CPIでは発表直後の初動より…', description: 'スレッド本文' }),
  category: z.string().openapi({ example: 'Market Discussion', description: 'カテゴリ' }),
  replyCount: z.number().int().nonnegative().openapi({ example: 12, description: '返信数' }),
  createdAt: z.string().datetime().openapi({ example: '2026-04-01T12:00:00.000Z', description: '作成日時（ISO 8601）' }),
}).openapi('CommunityThread');

export type CommunityThread = z.infer<typeof CommunityThreadSchema>;

/**
 * CreateCommunityThreadInputSchema は新規スレッド作成時のバリデーションスキーマです。
 * @responsibility: タイトル・本文・カテゴリの基本バリデーションを行う。
 */
export const CreateCommunityThreadInputSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは1文字以上で入力してください')
    .max(200, 'タイトルは200文字以内で入力してください')
    .openapi({ example: 'CPI発表前後のXAUUSDの値幅について', description: 'スレッドタイトル' }),
  body: z
    .string()
    .min(1, '本文は1文字以上で入力してください')
    .max(5000, '本文は5000文字以内で入力してください')
    .openapi({ example: '前回CPIでは発表直後の初動より…', description: 'スレッド本文' }),
  category: z
    .string()
    .max(50, 'カテゴリは50文字以内で入力してください')
    .default('General')
    .openapi({ example: 'Market Discussion', description: 'カテゴリ' }),
}).openapi('CreateCommunityThreadInput');

export type CreateCommunityThreadInput = z.infer<typeof CreateCommunityThreadInputSchema>;
