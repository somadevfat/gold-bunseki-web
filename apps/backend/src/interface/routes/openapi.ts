import { createRoute, z } from "@hono/zod-openapi";
import { PriceRecordSchema } from "../../domain/entities/price";
import { ZigZagPointSchema } from "../../domain/entities/zigzag";
import { SessionVolatilitySchema } from "../../domain/entities/session";
import { SyncStatusSchema } from "../../domain/entities/syncStatus";
import { ReplayDataResponseSchema } from "../../domain/entities/replay";

/**
 * Health Check ルート
 */
export const healthRoute = createRoute({
  method: "get",
  path: "/health",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ status: z.string().openapi({ example: "ok" }) }),
        },
      },
      description: "APIの動作状況を返します",
    },
  },
});

/**
 * 価格取得ルート
 */
export const latestPriceRoute = createRoute({
  method: "get",
  path: "/api/v1/prices/latest",
  responses: {
    200: {
      content: { "application/json": { schema: PriceRecordSchema.nullable() } },
      description: "最新の価格情報を取得します",
    },
  },
});

/**
 * ZigZag計算ルート
 */
export const calculateZigZagRoute = createRoute({
  method: "get",
  path: "/api/v1/zigzag/calculate",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            points: z.array(ZigZagPointSchema),
          }),
        },
      },
      description: "ZigZag計算を実行し、転換点を返します",
    },
    500: {
      description: "サーバー内部エラー",
    },
  },
});

/**
 * 指標一覧ルート
 */
export const marketIndicatorsRoute = createRoute({
  method: "get",
  path: "/api/v1/market/indicators",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            indicators: z.array(z.string().openapi({ example: "[USD] CPI" })),
          }),
        },
      },
      description: "直近の経済指標名の一覧を取得します",
    },
    500: {
      description: "サーバー内部エラー",
    },
  },
});

/**
 * セッション一覧ルート
 */
export const marketSessionsRoute = createRoute({
  method: "get",
  path: "/api/v1/market/sessions",
  request: {
    query: z.object({
      limit: z
        .string()
        .optional()
        .default("10")
        .openapi({
          param: { name: "limit", in: "query" },
          example: "10",
          description: "取得する件数",
        }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            sessions: z.array(SessionVolatilitySchema),
            currentCondition: z.string().openapi({ example: "Large" }),
          }),
        },
      },
      description: "直近のセッション別ボラティリティ情報を取得します",
    },
    500: {
      description: "サーバー内部エラー",
    },
  },
});

/**
 * 再現データルート
 */
export const eventReplayRoute = createRoute({
  method: "get",
  path: "/api/v1/market/replay",
  request: {
    query: z.object({
      event: z.string().openapi({
        param: { name: "event", in: "query" },
        example: "ISM製造業PMI",
      }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: ReplayDataResponseSchema } },
      description: "指定した指標の前回チャートと統計データを取得します",
    },
    400: {
      description: "引数不正",
    },
    500: {
      description: "サーバー内部エラー",
    },
  },
});

export const syncStatusRoute = createRoute({
  method: "get",
  path: "/api/v1/sync/status",
  responses: {
    200: {
      content: { "application/json": { schema: SyncStatusSchema } },
      description: "現在のデータ同期状況を取得します",
    },
  },
});

/**
 * 同期実行トリガールート (Pull型)
 * フロントエンドからの「今すぐ同期」ボタンなどで使用
 */
export const triggerSyncRoute = createRoute({
  method: "post",
  path: "/api/v1/sync/trigger",
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ success: z.boolean(), message: z.string() }) } },
      description: "同期完了",
    },
    500: {
      description: "同期失敗",
    }
  },
});

/**
 * 同期受取用のDTOスキーマ定義 (Pythonからの生データを受け入れるため、厳格なEntityスキーマとは分ける)
 */
const SyncSessionDtoSchema = z.object({
  date: z.string(),
  sessionName: z.string(),
  startTimeJst: z.string(),
  endTimeJst: z.string(),
  highPrice: z.number().optional(),
  lowPrice: z.number().optional(),
  volatilityPoints: z.number(),
  hasEvent: z.boolean(),
  hasHighImpactEvent: z.boolean(),
  eventsLinked: z.string(),
});

const SyncPriceDtoSchema = z.object({
  timestamp: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
});

const SyncThresholdDtoSchema = z.object({
  sessionName: z.string(),
  smallThreshold: z.number(),
  largeThreshold: z.number(),
});

const SyncZigZagDtoSchema = z.object({
  timestamp: z.string(),
  price: z.number(),
  type: z.string(),
});

/**
 * データ同期(Push)受取
 */
export const syncDataRoute = createRoute({
  method: "post",
  path: "/api/v1/sync/data",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            events: z.array(z.unknown()).optional(), // イベント詳細フォーマットは一旦unknownで許容
            sessions: z.array(SyncSessionDtoSchema).optional(),
            candles: z.array(z.unknown()).optional(),
            prices: z.array(SyncPriceDtoSchema).optional(),
            thresholds: z.array(SyncThresholdDtoSchema).optional(),
            zigzagPoints: z.array(SyncZigZagDtoSchema).optional()
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ success: z.boolean(), message: z.string() }) } },
      description: "同期成功",
    },
    500: {
      description: "同期失敗",
    }
  },
});
