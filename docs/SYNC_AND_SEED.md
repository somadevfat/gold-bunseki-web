# データ同期とシードの手順 (Data Synchronization & Seeding Guide)

このドキュメントでは、MetaTrader 5 (MT5) から取得した過去の市場データと経済指標カレンダーを解析し、PostgreSQL データベースに初期データ（シードデータ）として一括投入する手順、および日々の差分同期を行う手順を説明します。

## アーキテクチャの概要

全体の同期フローは、用途に合わせて以下の2つのモードに完全に分離されています。

1.  **シードモード (手動実行・過去データの一括投入)**
    *   **実行環境:** ローカルWindows PC (MT5稼働環境)
    *   **役割:** 過去数年分（約150万件）の1分足を一括取得し、成型済みのCSV群をローカルに出力する。
    *   **投入方法:** 出力されたCSVを、PostgreSQL の `\copy` コマンドで本番・開発DBへ直接バルクインサートする。
2.  **同期モード (自動実行・直近データの差分更新)**
    *   **実行環境:** ローカルWindows PC (MT5稼働環境)
    *   **役割:** FastAPIサーバーとして常駐し、直近数時間分のデータのみを高速に取得・解析する。
    *   **投入方法:** 解析結果を JSON ペイロードにまとめ、Hono バックエンド (VPS上等) の `/api/v1/sync/data` エンドポイントへ HTTP POST 送信する。

---

## 1. シードデータの一括生成と投入 (Seed Mode)

過去数年分のデータをDBに投入する作業は、API経由ではなく **CSV生成とDBへの直接インポート (Bulk Insert)** で行います。これにより、大量のデータを安全かつ超高速に処理できます。

### Step 1.1: CSVファイルの生成 (ローカルPC側)

WindowsPC上で、MT5が起動しログインしていることを確認した上で、シード用スクリプトを実行します。

```bash
cd apps/analytics
# 仮想環境の有効化
.\venv\Scripts\activate

# 過去3年分 (約150万本) のデータを取得し、CSVを出力する
python scripts/generate_seed_csv.py --count 1500000
```

> **Note:** 実行が成功すると、`apps/analytics/seed_data/` フォルダ内に以下のCSVが生成されます。
> - `prices.csv` (1分足の生データ)
> - `economic_events.csv` (指標カレンダー)
> - `session_volatilities.csv` (セッションごとのボラティリティとイベントフラグ)
> - `session_thresholds.csv` (地合い判定の閾値)
> - `price_candles.csv` (フロントエンド表示用の成型済みキャンドル)

### Step 1.2: PostgreSQLへのインポート (ローカルまたはVPS)

生成したCSVをデータベースに流し込みます。データ量がそれほど膨大ではないため、VPS環境であっても手元のPCからリモートのPostgreSQLへ直接流し込むか、CSVファイルを一度VPSに転送（scp等）してから流し込みます。

#### 方法 A: ローカルDockerやリモートDBへ `psql` で流し込む場合

最も簡単で確実な方法は、ローカルにインストールされた `psql` クライアントの `\copy` メタコマンドを使用することです。このコマンドはクライアント側にあるCSVファイルを読み取り、サーバーへ転送します。

```bash
cd apps/analytics/seed_data

# 環境変数で接続先を指定
export PGUSER="user"
export PGPASSWORD="password"
export PGDATABASE="gold_vola_db"
export PGHOST="localhost" # VPSの場合はVPSのIPアドレスを指定
export PGPORT="5432"

# psqlを実行し、\copyコマンドで順番に流し込む
psql -c "\copy prices(timestamp, open, high, low, close) FROM 'prices.csv' DELIMITER ',' CSV HEADER;"
psql -c "\copy economic_events(datetime_jst, event_name, impact, actual, forecast, previous) FROM 'economic_events.csv' DELIMITER ',' CSV HEADER;"
psql -c "\copy session_volatilities(date, session_name, start_time_jst, end_time_jst, volatility_points, has_event, has_high_impact_event, events_linked) FROM 'session_volatilities.csv' DELIMITER ',' CSV HEADER;"
psql -c "\copy session_thresholds(session_name, small_threshold, large_threshold) FROM 'session_thresholds.csv' DELIMITER ',' CSV HEADER;"
psql -c "\copy price_candles(datetime_jst, session_name, open_price, high_price, low_price, close_price) FROM 'price_candles.csv' DELIMITER ',' CSV HEADER;"
```

#### 方法 B: VPS上でDockerを使っている場合 (scpで転送後)

VPS上で動かしているPostgreSQLコンテナに対して流し込む場合は、一度VPSにCSVを転送します。

```bash
# ローカルPCからVPSへCSVフォルダごと転送
scp -r apps/analytics/seed_data user@your-vps-ip:/path/to/project/

# VPS上でコンテナ内にCSVをコピーしてインポート (またはボリュームマウントして実行)
docker cp /path/to/project/seed_data gold-vola-db:/tmp/seed_data
docker exec -it gold-vola-db psql -U user -d gold_vola_db -c "\copy prices FROM '/tmp/seed_data/prices.csv' DELIMITER ',' CSV HEADER;"
# (...他テーブルも同様に実行)
```

---

## 2. 運用時の差分同期 (Sync Mode)

シード完了後、日々の運用で常に最新の市場データ（直近数十分〜数時間分）をバックエンドへ反映させる手順です。こちらはAPI経由で行います。

### Step 2.1: Honoバックエンドの起動 (VPS側 または ローカル)
APIの受け口となるバックエンドが起動していることを確認します（ポート `3000`）。

### Step 2.2: 同期用APIサーバーの起動 (ローカルPC側)
MT5が動いているWindowsPCで、常駐用のFastAPIサーバーを起動します。

```bash
cd apps/analytics
.\venv\Scripts\activate
python api/server.py
```

### Step 2.3: 同期のリクエスト (トリガー)
WindowsPCのタスクスケジューラやcron、あるいは手動で以下のエンドポイントにリクエストを送ると、即座にMT5から最新データが取得され、VPS上のHonoへ送信されます。

```bash
curl -X POST http://localhost:8000/api/sync
```

*(※ `apps/analytics/api/server.py` 内の `HONO_SYNC_URL` は、本番デプロイ時はVPSのドメイン/IPアドレスに書き換えてください)*

### Step 2.4: 指定時刻のJSON差分同期 (任意)
WindowsPC上で FastAPI サーバーを常時起動し、`SCHEDULED_SYNC_TIMES` を設定すると、指定時刻に
MT5 EA が出力した `gold_calendar_cache.json` の内容ハッシュを確認します。
前回Honoへ送信したJSONから変化がある場合だけ、既存の差分同期処理を実行して
`/api/v1/sync/data` へPOSTします。

```powershell
$env:API_TOKEN="backendと同じtoken"
$env:HONO_SYNC_URL="https://api.example.com/api/v1/sync/data"
$env:SCHEDULED_SYNC_TIMES="08:00,21:30"
$env:SCHEDULED_SYNC_TIMEZONE="Asia/Tokyo"
python api/server.py
```

補足:
- `SCHEDULED_SYNC_TIMES` が空の場合、スケジューラは無効です。
- 複数時刻は `08:00,21:30` のようにカンマ区切りで指定します。
- JSONの場所は通常 `%APPDATA%\MetaQuotes\Terminal\Common\Files\gold_calendar_cache.json` を自動検出します。
- `CALENDAR_CACHE_PATH` を設定すると、任意のJSONファイルを監視対象にできます。
- 前回POST済みハッシュは `SCHEDULED_SYNC_STATE_PATH`、未指定時は `apps/analytics/.sync_state.json` に保存されます。
