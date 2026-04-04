# 🚀 デプロイメント手順書 (VPS Backend / Cloudflare Frontend)

このプロジェクトのハイブリッド環境（VPS上のバックエンド + Cloudflare上のフロントエンド）へデプロイするための公式手順書です。

---

## 📍 1. アーキテクチャ構成

- **Frontend**: Cloudflare Pages (CDNから全世界へ高速配信)
- **Backend API**: VPS (Bun サーバー + Nginx リバースプロキシ + Let's Encrypt SSL)
- **Database**: VPS (Docker Compose による PostgreSQL)

---

## 📍 2. フロントエンドのデプロイ (Cloudflare Pages)

フロントエンドは GitHub Actions による CI/CD パイプラインで完全自動化されています。

### 2.1 自動デプロイ (推奨)
1. `main` ブランチに変更をプッシュ（または PR をマージ）します。
2. GitHub Actions が `apps/frontend` の変更を検知し、自動的にビルド (`bun run build:vinext`) を実行します。
3. ビルドされた静的ファイル (`dist`) が Cloudflare Pages にデプロイされます。

### 2.2 手動デプロイ (緊急時)
GitHub の [Actions] タブから `Continuous Deployment` ワークフローを選択し、「Run workflow」ボタンを押すことでいつでも手動デプロイが可能です。

※ **事前設定**: GitHub Secrets に `CLOUDFLARE_API_TOKEN` を登録しておく必要があります。

---

## 📍 3. バックエンド・データベースのデプロイ (VPS環境)

バックエンドは専用の VPS サーバーで稼働します。初回セットアップ以降は、必要に応じて手動（または CI/CD 拡張）で更新します。

### 3.1 初回セットアップ (VPS上での作業)
1. **リポジトリのクローン**:
   ```bash
   git clone https://github.com/somadevfat/gold-bunseki-kun.git
   cd gold-bunseki-kun
   ```
2. **データベース (PostgreSQL) の起動**:
   Docker Compose を使用して PostgreSQL を起動します。
   ```bash
   docker-compose up -d db
   ```
3. **Bun のインストールとパッケージ同期**:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   bun install
   ```

### 3.2 アプリケーションの起動
VPS 上でバックエンドの Hono API を Bun で直接起動します。PM2 や systemd などのプロセス管理ツールを使用することを推奨します。

```bash
cd apps/backend
bun run src/index.ts
```

### 3.3 Nginx によるリバースプロキシ設定
バックエンド API (デフォルトポート例: 8787) をインターネットに公開するため、Nginx を設定して 443 (HTTPS) を中継します。

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8787;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3.4 データベースへのシード (データ流し込み)
ローカルの Windows 環境（Python/MT5）で `sync_direct.py` を実行し、API 経由で VPS のバックエンドへデータを POST することで初期データを構築します。
（本番用 API エンドポイント `https://api.yourdomain.com/api/v1/sync/data` に向けます）

---

## 📍 4. 今後の拡張 (CI/CD)

バックエンドの VPS デプロイも GitHub Actions で自動化する場合は、`.github/workflows/cd.yml` に「SSH で VPS に接続し、`git pull` と `pm2 restart` を実行する」ステップを追加してください。
