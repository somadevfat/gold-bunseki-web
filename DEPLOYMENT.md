# 🚀 デプロイメント手順書 (Cloudflare Workers / D1)

このプロジェクトを Cloudflare の本番環境へデプロイするための公式手順書です。

---

## ⚠️ 重要な注意事項 (Before You Deploy)

- **ローカルデプロイ**: `bun run deploy` は、Git のブランチに関係なく **「現在手元にあるコード」** を本番にアップロードします。
- **推奨フロー**: 事故を防ぐため、必ず `main` ブランチに切り替え、最新の状態を `git pull` してからデプロイすることを強く推奨します。

---

## 📍 1. 事前準備

### 1.1 Cloudflare へのログイン
ブラウザが起動し、Cloudflare アカウントとの連携を求められます。
```bash
bunx wrangler login
```
- **解説**: CLI ツール (wrangler) があなたの Cloudflare アカウントを操作するための認証を行います。

### 1.2 D1 データベースの作成（初回のみ）
```bash
bunx wrangler d1 create gold-vola-db
```
- **解説**: 本番環境用のマネージド型 SQLite データベース (D1) を作成します。
- **database_id**: 作成時に表示される ID を `apps/backend/wrangler.jsonc` の `database_id` フィールドにコピーしてください。

---

## 📍 2. バックエンドのデプロイ (apps/backend)

### 2.1 データベース・マイグレーション
```bash
cd apps/backend
bunx wrangler d1 execute gold-vola-db --remote --file=./migrations/0001_initial_schema.sql
```
- **解説**: ローカルにある SQL ファイルを **本番用 (--remote)** データベースに実行し、テーブルを作成します。

### 2.2 Workers へのデプロイ
```bash
cd apps/backend
bun run deploy
```
- **実際のコマンド**: `wrangler deploy --minify`
- **解説**: TypeScript コードを Cloudflare Workers が理解できる形式にバンドルし、アップロードします。`--minify` はコードを圧縮して実行速度を最適化します。

---

## 📍 3. フロントエンドのデプロイ (apps/frontend)

### 3.1 vinext のビルド
```bash
cd apps/frontend
bun run build:vinext
```
- **実際のコマンド**: `vite build`
- **解説**: React コンポーネントやアセットを最適化された静的ファイル（HTML/JS/CSS）に変換し、`dist/client` ディレクトリに出力します。

### 3.2 Workers へのデプロイ
```bash
cd apps/frontend
bunx wrangler deploy
```
- **解説**: ビルドされた静的ファイルと、エッジで動作する `worker/index.ts` を Cloudflare にアップロードします。Cloudflare Workers の「Assets」機能により、静的サイトとして公開されます。

---

## 📍 4. 環境変数の設定 (Secrets)

デプロイ後、API キーなどの機密情報を設定します。

```bash
bunx wrangler vars put ANALYTICS_SERVICE_URL --name backend
```
- **解説**: `wrangler.jsonc` に書けない機密情報を Cloudflare のサーバー側に安全に保存します。バックエンドが外部の分析エンジンと通信するために必要です。

---

## 📍 5. 運用・トラブルシューティング

### リアルタイムログの確認
```bash
# 本番環境で今まさに起きているエラーを監視
cd apps/backend && bunx wrangler tail
```

### データベースの直接操作
```bash
# 本番のデータを直接 SQL で確認
cd apps/backend && bunx wrangler d1 execute gold-vola-db --remote --command="SELECT count(*) FROM prices;"
```
