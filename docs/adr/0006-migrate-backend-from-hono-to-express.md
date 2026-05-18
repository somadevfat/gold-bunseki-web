# ADR-0006: Backend を Hono から Express へ移行する

## ステータス
承認済み

## コンテキスト
本プロジェクトの backend は Bun/Hono で実装しているが、ポートフォリオとして公開・説明する際に、採用側へ伝わりやすい一般的な技術スタックで見せたいという要件がある。現在の構成では Hono が routing、middleware、OpenAPI、typed client、test harness を担っている一方、domain/use case/repository は HTTP framework から分離されているため、HTTP 層だけを Express に置き換える余地がある。

## 決定事項
backend の HTTP framework を Hono から Express へ移行する。

- 既存 API の URL、request/response JSON、status code は維持する
- domain/use case/repository の構造は維持する
- validation は既存の Zod schema を再利用する
- Hono 固有の OpenAPI、middleware、typed client、test harness は Express 対応の実装へ置き換える
- 移行作業の具体的な進め方は `docs/hono-to-express-migration-plan.md` に記録する

## 結果
Express を採用することで、ポートフォリオ説明時の認知負荷を下げ、一般的な Node.js backend の経験として伝えやすくなる。一方で、Hono が提供していた OpenAPI 連携と型付き client の利便性は失われるため、代替実装を自前で維持する必要がある。移行コストは発生するが、HTTP 層の責務が分離されているため、アプリ全体の再設計までは不要である。
