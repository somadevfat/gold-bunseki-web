# Hono から Express への移行プラン

## 結論

- 現在のブランチ: `features/issue-40-edit-delete-research-notes`
- 判定日: 2026-05-18
- 結論: 今日中に移行完了まで進めることは可能
- ただし条件: API 契約を維持し、OpenAPI/Swagger と型付きクライアントの置き換え方を最初に固定する

## なぜ Express に変えるか

- ポートフォリオでは、採用側に説明しやすい一般的な技術スタックで見せたい
- Express は認知度が高く、README や面接での説明コストが低い
- 今回のアプリは Bun 上で動いているが、HTTP 層を Express にしてもドメイン層・ユースケース層・Repository 層はほぼ維持できる

## 現状確認

### Hono 依存がある主な箇所

- アプリ生成: `apps/backend/src/app/createApp.ts`
- 起動点: `apps/backend/src/index.ts`
- ルーティング/OpenAPI: `apps/backend/src/interface/routes/*`
- Controller: `apps/backend/src/interface/controller/*`
- Middleware: `apps/backend/src/interface/middleware/*`
- HTTP エラー整形: `apps/backend/src/interface/http/errorResponse.ts`
- テスト補助: `apps/backend/src/interface/test/testHelpers.ts`
- フロントエンド API クライアント: `apps/frontend/src/lib/api/client.ts`
- 依存関係: `hono`, `@hono/zod-openapi`, `@hono/swagger-ui`, `hono/client`

### 移行規模の目安

- Hono ベースの API ルート定義: 17 本
- バックエンドのテストファイル: 36 本
- 主な再実装対象:
  - CORS
  - security headers
  - request id
  - structured logging
  - bearer auth
  - not found / error handler
  - request validation
  - OpenAPI / Swagger UI
  - 統合テストの `app.request()` 置換

## 今日中に終えるための方針

### 維持するもの

- URL
- HTTP method
- request/response JSON
- status code
- domain / use case / repository の構造
- 既存の Zod schema

### 置き換えるもの

- Hono app -> Express app
- `@hono/zod-openapi` の route registration -> Express Router + Zod validation
- `hono/client` -> fetch ベースの薄い API client
- Hono の middleware / Context -> Express middleware / `Request`, `Response`, `NextFunction`
- `app.request()` ベースの統合テスト -> `supertest`

### 採用候補

- `express`
- `cors`
- `helmet`
- `swagger-ui-express`
- `zod`
- `@asteasolutions/zod-to-openapi` または既存 schema からの OpenAPI 生成方針
- `supertest`

## 実行順

1. **設計固定**
   - Express 版のミドルウェア構成を決める
   - validation と OpenAPI 生成の方式を決める
   - フロントの API client を `fetch` ベースへ置き換える方針を決める

2. **土台の載せ替え**
   - `createApp.ts` を Express app 構成へ置き換える
   - `index.ts` を `app.listen()` ベースへ変更する
   - request id / logger / CORS / bearer auth / error handler を Express 用へ移植する

3. **ルート移行**
   - health
   - market
   - sync
   - community
   - research notes
   - 既存 Zod schema を流用して validation を入れる

4. **ドキュメント/API 契約**
   - `/doc`
   - `/swagger`
   - README の `Hono/Bun` 表記を `Express/Bun` へ更新

5. **フロント連携**
   - `hono/client` 依存を外す
   - 既存の呼び出し側 API をなるべく変えずに差し替える

6. **テスト移行**
   - Controller の mock context を Express 向けへ更新
   - middleware / error handler / integration test を `supertest` ベースへ変更
   - `bun test` を通す

7. **仕上げ**
   - `rg "hono"` で残存依存を確認
   - lockfile / package.json を更新
   - `/health`, `/swagger`, 主要 API を手動確認

## 今日の時間配分

| 時間 | 作業 |
|---|---|
| 1.0h | 方針確定、依存追加、Express app の骨組み |
| 2.0h | middleware / error handling / auth 移植 |
| 2.0h | route + validation + OpenAPI 移植 |
| 1.0h | frontend client 差し替え |
| 1.5h | test 移行と修正 |
| 0.5h | README、残存依存確認、手動確認 |

合計目安: **8 時間前後**

## リスクと対策

| リスク | 対策 |
|---|---|
| `@hono/zod-openapi` を外すと OpenAPI 生成が崩れる | 先に代替方式を決め、schema は Zod のまま維持する |
| `hono/client` の型推論が消える | API client を明示型で定義し、既存呼び出し側の変更を最小化する |
| Hono の `Context` 前提の Controller が多い | Controller を Express handler へ寄せ、use case 層は触らない |
| 統合テストの書き換え量が読みにくい | `supertest` 導入後、health -> market -> notes の順で代表 API から通す |
| 今日中に終わらず中途半端になる | まず API 契約維持を優先し、OpenAPI の見栄え改善は後回しにする |

## 完了条件

- [ ] `bun test` が通る
- [ ] `bun run lint` が通る
- [ ] `GET /health` が 200 を返す
- [ ] `/swagger` が表示できる
- [ ] 主要 API の request/response が移行前と同じ
- [ ] フロントエンドから既存画面が動く
- [ ] `rg "from ['\\\"]hono|@hono|hono/client"` で意図しない残存依存がない
- [ ] README と ADR が更新されている

## 今日やるなら最初の 3 手

1. Express 採用を ADR に記録する
2. `express`, `cors`, `helmet`, `swagger-ui-express`, `supertest` を追加する
3. `createApp.ts` と `index.ts` を Express 版に差し替え、`GET /health` だけ先に通す
