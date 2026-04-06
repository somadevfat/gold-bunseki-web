# Python Market Analysis Engine

このディレクトリ (`apps/analytics/`) には、MetaTrader 5 (MT5) からデータを取得し、地合い判定の解析を行った後、バックエンド (PostgreSQL) へ同期するためのスクリプトが含まれています。

## 📂 ディレクトリ構成とスクリプトの役割

- **`market_analyzer.py`**: コアとなる解析エンジン。価格データと経済指標を組み合わせてボラティリティを計算します。単体で実行するとデバッグ用のCSVを出力できます。
- **`seed.py`**: **【シード用】** 過去の大量のデータ（例: 過去1年半分の50万件など）を一括で取得・解析し、バックエンドの **`/api/v1/sync/seed`** に送信します。初回のデータベース構築時に1度だけ実行します。
- **`sync.py`**: **【常用同期用】** 直近の数百件のデータのみを高速に取得・解析し、バックエンドの **`/api/v1/sync/data`** に送信します。実稼働時は、タスクスケジューラなどで1分ごとに定期実行させます。

## 🚀 実行フロー (ローカルから VPS への同期)

1. **前提条件**
   - デスクトップで MT5 が起動しており、ログイン状態であること。
   - MT5 側に `GoldCalendarPush.mq5`（EA）がセットされており、バックグラウンドで `gold_calendar_cache.json` が `%APPDATA%` 内に生成されていること。
   - バックエンド (Hono API) が起動していること（`make dev` または VPS 上で稼働）。

2. **初回シード（データの一括投入）**
   ```bash
   cd apps/analytics
   # 仮想環境を有効化 (Windows)
   .\venv\Scripts\activate
   
   # シードスクリプトを実行 (時間がかかります)
   python seed.py
   ```

3. **常用同期（1分ごとの差分更新）**
   ```bash
   cd apps/analytics
   .\venv\Scripts\activate
   
   # 同期スクリプトを実行 (高速)
   python sync.py
   ```
