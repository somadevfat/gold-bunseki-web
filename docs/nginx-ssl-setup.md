# Nginx + SSL セットアップ手順

## ゴール: GCE + Cloudflare がデプロイ済みの状態から `https://api.fanda-dev.com` でフロントから叩けるようにする

---

## 前提確認

| 状態                                         | 確認方法                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| GCE VM が起動している                        | GCP コンソール → Compute Engine でインスタンスが `実行中`                                              |
| docker compose が動いている                  | VM に SSH して `sudo docker compose ps` → backend, db が `Up`                                          |
| Cloudflare で `fanda-dev.com` を管理している | Cloudflare Dashboard → DNS タブが存在する                                                              |
| GCE の外部IPが固定されている                 | GCP → VPCネットワーク → 外部IPアドレス で `静的` になっているか確認。`エフェメラル` なら静的に変更する |

---

## Step 1: Cloudflare DNS に Aレコードを追加する

Cloudflare Dashboard → `fanda-dev.com` → **DNS** タブを開く。

**「レコードを追加」** をクリックして以下を入力：

| フィールド   | 値                                                             |
| ------------ | -------------------------------------------------------------- |
| タイプ       | `A`                                                            |
| 名前         | `api`                                                          |
| IPv4アドレス | GCE インスタンスの外部IP（例: `34.xx.xx.xx`）                  |
| プロキシ     | **グレー（DNSのみ）** ← certbot が失敗するのでオレンジにしない |

保存後、浸透確認：

```bash
# ローカルまたはVM上で実行
dig api.fanda-dev.com

# 返ってくる ANSWER SECTION が GCE の外部IP なら OK
```

---

## Step 2: GCP ファイアウォールを確認する

GCP コンソール → **VPCネットワーク → ファイアウォール** を開く。

以下のルールが存在するか確認する（インスタンス作成時に HTTP/HTTPS を許可していれば自動作成済み）：

| ルール              | プロトコル/ポート |
| ------------------- | ----------------- |
| default-allow-http  | tcp:80            |
| default-allow-https | tcp:443           |

ポート `3000` を許可するルールは**不要**（Nginxが内部で転送するため）。もし `tcp:3000` を許可するルールがあれば削除する。

---

## Step 3: GCE VM に SSH して git pull する

GCP コンソール → Compute Engine → インスタンス横の **[SSH]** をクリック。

```bash
# リポジトリのディレクトリへ移動
cd ~/gold-bunseki-kun    # クローン先のパスに合わせて変更

# 最新コードを取得（infra/nginx/api.conf と docker-compose.yml の修正を反映）
git pull origin main
```

今回 git pull で取り込まれる変更：

- `infra/nginx/api.conf` （新規追加）― Nginx의 設定ファイル
- `docker-compose.yml` ― ポート `3000` を `127.0.0.1:3000` に変更してVM外部に露出させない修正

---

## Step 4: Nginx + certbot をインストールする

```bash
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

---

## Step 5: Nginx 設定ファイルを配置する

```bash
# リポジトリの設定ファイルを Nginx の設定ディレクトリにコピー
sudo cp ~/gold-bunseki-kun/infra/nginx/api.conf /etc/nginx/sites-available/api.conf

# 有効化（sites-enabled にシンボリックリンクを張る）
sudo ln -s /etc/nginx/sites-available/api.conf /etc/nginx/sites-enabled/api.conf

# デフォルト設定を無効化（競合するため削除）
sudo rm -f /etc/nginx/sites-enabled/default

# 設定ファイルの構文チェック
sudo nginx -t
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
# ↑ この2行が出れば OK

# Nginx を起動して自動起動も設定
sudo systemctl enable nginx
sudo systemctl start nginx
```

動作確認（SSL前・HTTP段階）：

```bash
curl http://api.fanda-dev.com/api/v1/market/indicators
# {"status":"ok"...} が返れば Nginx → Bun の転送が動いている
```

---

## Step 6: Let's Encrypt SSL 証明書を取得する

```bash
# certbot が Nginx の設定を自動で読んで証明書を取得・設定してくれる
sudo certbot --nginx -d api.fanda-dev.com
```

対話式で以下を聞かれる：

- メールアドレス → 証明書の期限通知に使う（何でも可）
- 利用規約に同意するか → `A` で同意
- HTTPをHTTPSにリダイレクトするか → `2`（Redirect）を選ぶ

成功すると:

- `/etc/letsencrypt/live/api.fanda-dev.com/` に証明書が生成される
- `/etc/nginx/sites-available/api.conf` が certbot によって SSL の設定を追記した内容に自動更新される

証明書の自動更新テスト（問題ないか確認するだけ・実際には更新しない）：

```bash
sudo certbot renew --dry-run
# Congratulations, all simulated renewals succeeded. ← が出ればOK
```

---

## Step 7: docker-compose の変更を反映する

git pull で `docker-compose.yml` のポート設定が変わっているので、コンテナを再起動して反映させる：

```bash
cd ~/gold-bunseki-kun
sudo docker compose down
sudo docker compose up -d
```

---

## Step 8: バックエンドの疎通確認

```bash
# HTTPS でエンドポイントを叩く
curl https://api.fanda-dev.com/api/v1/market/indicators

# JSON が返ってくれば完了
```

---

## Step 9: Cloudflare Workers（フロント）の環境変数を設定する

Cloudflare Dashboard → **Workers & Pages** → プロジェクトを選択 → **Settings** → **Variables and Secrets** を開く。

**「Add」** をクリックして追加：

| 変数名                | 値                          | タイプ   |
| --------------------- | --------------------------- | -------- |
| `NEXT_PUBLIC_API_URL` | `https://api.fanda-dev.com` | テキスト |

保存後、フロントを再デプロイ（設定変更は再デプロイしないと反映されない）：

```bash
# ローカルから
cd apps/frontend
bun run deploy
```

---

## Step 10: .env の ALLOWED_ORIGINS を確認する

GCE VM の `.env` にフロントエンドの URL が含まれているか確認：

```bash
cat ~/gold-bunseki-kun/.env | grep ALLOWED_ORIGINS
```

フロントのドメイン（`https://fanda-dev.com` など）が含まれていない場合は追記して再起動：

```bash
# .env を編集
nano ~/gold-bunseki-kun/.env

# ALLOWED_ORIGINS の行を以下のように更新
ALLOWED_ORIGINS=https://fanda-dev.com,https://www.fanda-dev.com,https://gold-vola-frontend.somahiranodev.workers.dev

# コンテナ再起動
sudo docker compose down && sudo docker compose up -d
```

---

## 最終確認チェックリスト

```bash
# 1. Nginx が動いているか
sudo systemctl status nginx

# 2. コンテナが動いているか
sudo docker compose ps

# 3. HTTPS でバックエンドが叩けるか
curl https://api.fanda-dev.com/api/v1/market/indicators

# 4. 証明書の有効期限確認
sudo certbot certificates
```

ブラウザでフロントエンドを開いて、データが表示されれば完了。
