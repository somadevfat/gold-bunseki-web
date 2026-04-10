# デプロイ手順書 (Frontend: Cloudflare / Backend: GCP)

このドキュメントは、本番環境へのデプロイ作業を「フロントエンド（Cloudflare）」と「バックエンド＋DB（GCP Compute Engine）」の2段階に分けて解説する手順書です。ウェブ上の最新の公式ベストプラクティスに従って構成しています。

---

## 1. フロントエンドのデプロイ (Cloudflare Workers)

今回は `vinext` を用いて、エッジコンピューティング環境である Cloudflare Workers にデプロイします。コマンド一発でデプロイが完了します。

### 事前準備: Cloudflareアカウントの用意
- [Cloudflareの公式サイト](https://dash.cloudflare.com/sign-up) でアカウントを作成（無料枠で十分です）。
- 事前にローカルでログインを行います。

```bash
# プロジェクトルートからフロントエンドへ移動
cd apps/frontend

# Cloudflareへログイン（ブラウザが開くので承認する）
npx wrangler login
```

### デプロイ手順
`package.json` に設定した `deploy` スクリプトを利用してビルド〜公開を一気に行います。

```bash
# デプロイコマンドの実行
bun run deploy
```

> **参考URL:** 
> - [Cloudflare Workers: `wrangler deploy` の公式ドキュメント](https://developers.cloudflare.com/workers/wrangler/commands/#deploy)
> - [Vinext: Cloudflare対応状況](https://github.com/hi-ogawa/vinext)

成功すると、`https://web.<あなたのサブドメイン>.workers.dev` のような公開URLがターミナルに出力されます。これでフロントエンドのデプロイは完了です！

---

## 2. バックエンド＆DBのデプロイ (GCP Compute Engine)

GCPの Compute Engine (GCE) 上に、ソースコードをクローンして `docker compose` で本番環境を構築します。

### Step 2.1: GCEインスタンスの作成
1. [Google Cloud Console (Compute Engine)](https://console.cloud.google.com/compute/instances) にアクセス。
2. **「インスタンスを作成」** をクリック。
3. 以下の設定で作成します。
   - **マシン構成:** `e2-micro` または `e2-small`（無料枠・トラフィックに応じて変更）
   - **ブートディスク:** 安定の `Ubuntu 22.04 LTS` を推奨（サイズは10GB~20GB程度）
   - **ファイアウォール:** **HTTP トラフィックを許可する** / **HTTPS トラフィックを許可する** の両方にチェック
> **重要情報 (Networking):** バックエンド（3000番ポート）への直接アクセスが必要な場合、Google Cloud Consoleの「VPCネットワーク > ファイアウォール」から `tcp:3000` を許可するルールを作成し、このインスタンスに適用してください。

### Step 2.2: インスタンスへのSSH接続とセットアップ
作成したインスタンスの **[SSH]** ボタンを押してブラウザからターミナルを開きます。
まずは Docker をインストールします。

```bash
# パッケージの更新
sudo apt-get update

# Docker および Docker Compose のインストール（Ubuntuの場合）
sudo apt-get install -y docker.io docker-compose-v2 git

# Dockerをsudoなしで使えるようにする（任意）
sudo usermod -aG docker $USER
newgrp docker
```
> **参考URL:** [GCP: Compute Engineでのコンテナのデプロイ (Google Cloud 公式)](https://cloud.google.com/compute/docs/containers?hl=ja)

### Step 2.3: ソースコードの取得
GCE上でこのリポジトリを `git clone` します（GitHubのトークンやSSHキーを設定するか、パブリックリポジトリならそのままクローンできます）。

```bash
git clone https://github.com/somadevfat/task-ranking-mcp.git
cd task-ranking-mcp
```

### Step 2.4: バックエンド・コンテナの起動
リポジトリ直下にある `docker-compose.yml` を使って本番起動します。

```bash
# Dockerコンテナのバックグラウンド起動
sudo docker compose up -d --build
```
> 起動が完了すると、`gold-vola-db`（PostgreSQL）と `gold-vola-backend`（Hono）の2つのコンテナが常駐稼働します。

### Step 2.5: 本番DBへのシード導入
本番環境のDB（`db`コンテナ）に、ローカルで作成したシードデータ（CSVファイル）を手動で投入します。

```bash
# コンテナ内にCSVとSQLをコピー等で移し、GCE上で以下のコマンドを実行
sudo docker exec -i gold-vola-db psql -U user -d gold_vola_db < apps/analytics/seed_data/seed_transaction.sql
```

稼働確認として `curl http://localhost:3000/api/v1/market/indicators` を叩いてJSONが返ってくればバックエンドのデプロイは完了です！

---

## 3. アプリの結合
最後に、Cloudflare（フロントエンド）がどこのバックエンドAPIと通信するかを教えてあげます。

1. **GCPの静的外部IPアドレス**（インスタンスの詳細画面で確認可能）をメモします。
2. フロントエンドの `apps/frontend/src/lib/api/client.ts` などで参照している環境変数を、Cloudflare Workersに設定します。
   - `wrangler.jsonc` （あるいは `npx wrangler secret put` コマンド等）を使って本番の外部IPに向けます。
   - 例: `NEXT_PUBLIC_API_URL=http://<GCPの外部IP>:3000`

以上で、高速で堅牢なフル機能のフルスタックアプリの本番稼働が実現します。
