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
