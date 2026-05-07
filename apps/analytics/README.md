# Python Analytics Engine

このディレクトリ (`apps/analytics/`) には、MetaTrader 5 (MT5) からデータを取得し、経済指標カレンダーと組み合わせてボラティリティを解析する Python アプリケーションが含まれています。

## 📂 ディレクトリ構成

- **`core/market_analyzer.py`**:
  - 【共通ロジック】価格データと経済指標を組み合わせ、セッションごとのボラティリティや地合いを算出するコアエンジン。
- **`scripts/generate_seed_csv.py`**:
  - 【シードデータ生成用】MT5から過去数年分（デフォルト3年、約150万件）の1分足を取得し、PostgreSQL投入用のCSV群を `seed_data/` に出力するシンプルな手動スクリプト。
- **`api/server.py`**:
  - 【運用APIサーバー】FastAPIで動作し、外部からのリクエストに応じてMT5から直近の差分データを取得・解析し、バックエンド (Hono) へJSONでPush送信する。

## 🚀 実行手順

### 前提条件
- デスクトップで MT5 が起動しており、ログイン状態であること。
- MT5 側に `GoldCalendarPush.mq5` がセットされ、バックグラウンドで `%APPDATA%\MetaQuotes\Terminal\Common\Files\gold_calendar_cache.json` が生成されていること。
- Pythonの仮想環境を有効化し、必要なパッケージをインストールしていること。
  ```bash
  cd apps/analytics
  python -m venv venv
  .\venv\Scripts\activate
  pip install -r requirements.txt
  ```

### 1. 初回のデータ投入 (CSVシード)
DB構築時など、過去の大量のデータを一括で投入したい場合に使用します。
MT5からサーバーの過去データを取得し、CSVとして出力します。

```bash
# 過去データの取得とCSV生成 (--count は 1分足の取得件数)
# 例: 1500000件 ≒ 約3年分
python scripts/generate_seed_csv.py --count 1500000
```

生成されたCSV群は `apps/analytics/seed_data/` に出力されます。
これらをPostgreSQLコンテナへ投入するには、以下のコマンド（psqlクライアントのルート機能）を実行します。

```bash
cd apps/analytics/seed_data

# DBの接続情報をセット
export PGUSER="user"
export PGPASSWORD="password"
export PGDATABASE="gold_vola_db"
export PGHOST="localhost"
export PGPORT="5432"

# \copy コマンドでCSVをサーバ内PostgreSQLへバルクインサートする
psql -c "\copy prices(timestamp, open, high, low, close) FROM 'prices.csv' DELIMITER ',' CSV HEADER;"
psql -c "\copy economic_events(datetime_jst, event_name, impact, actual, forecast, previous) FROM 'economic_events.csv' DELIMITER ',' CSV HEADER;"
psql -c "\copy session_volatilities(date, session_name, start_time_jst, end_time_jst, volatility_points, has_event, has_high_impact_event, events_linked) FROM 'session_volatilities.csv' DELIMITER ',' CSV HEADER;"
psql -c "\copy session_thresholds(session_name, small_threshold, large_threshold) FROM 'session_thresholds.csv' DELIMITER ',' CSV HEADER;"
psql -c "\copy price_candles(datetime_jst, session_name, open_price, high_price, low_price, close_price) FROM 'price_candles.csv' DELIMITER ',' CSV HEADER;"
```

### 2. 運用時の差分同期 (FastAPIサーバー)
日々の運用で、最新のデータをHonoバックエンドへAPI経由でPush（送信）する場合に使用します。

```bash
# FastAPIサーバーを起動（デフォルト: ポート8000）
python api/server.py
```
サーバー起動後、タスクスケジューラなどで定期的に以下のエンドポイントを叩くことで、差分データがVPS上のHonoへPushされます。
```bash
curl -X POST http://localhost:8000/api/sync
```

### 3. 指定時刻のJSON差分同期
`SCHEDULED_SYNC_TIMES` を設定して FastAPI サーバーを常時起動すると、指定時刻に
`gold_calendar_cache.json` の内容ハッシュを確認し、前回Honoへ送信したJSONと差分がある場合だけ
既存の同期処理を実行します。差分がない時刻はスキップされます。

```powershell
$env:API_TOKEN="backendと同じtoken"
$env:HONO_SYNC_URL="https://api.example.com/api/v1/sync/data"
$env:SCHEDULED_SYNC_TIMES="08:00,21:30"
$env:SCHEDULED_SYNC_TIMEZONE="Asia/Tokyo"
python api/server.py
```

任意設定:
- `CALENDAR_CACHE_PATH`: MT5の共通フォルダ以外にJSONを置く場合のパス
- `SCHEDULED_SYNC_STATE_PATH`: 前回POST済みハッシュを保存するstateファイル
- `SCHEDULED_SYNC_POLL_SECONDS`: 指定時刻を確認する間隔（デフォルト30秒）
- `SCHEDULED_SYNC_DUE_WINDOW_SECONDS`: 指定時刻から何秒以内を実行対象にするか（デフォルト90秒）
- `SCHEDULED_SYNC_SYMBOL`: MT5から取得する銘柄（デフォルト`GOLD`）
- `SCHEDULED_SYNC_FETCH_COUNT`: 取得する直近1分足の本数（デフォルト`500`）
