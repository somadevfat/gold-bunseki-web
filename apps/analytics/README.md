# Analytics Engine (Python)

MT5 (MetaTrader 5) から取得した GOLD (XAUUSD) の価格データと、米国経済指標カレンダーを統合・分析し、Cloudflare D1 (Hono) へ送信・またはインポート用ファイルとして出力するための Python アプリケーション群です。

## 📂 スクリプトの役割 (Scripts Overview)

用途に合わせて以下のスクリプトを使い分けます。

| スクリプト名 | 役割・用途 | 実行方法 |
| :--- | :--- | :--- |
| **`sync_direct.py`** | **【初期セットアップ用】** 過去3年分などの大量のデータを MT5 から一括取得し、Cloudflare D1 インポート用の **CSVファイル** として出力します。 | `python sync_direct.py --years 3` |
| **`gui.py`** | **【手動更新用】** 直近の数千件のデータを、ボタン一つで Hono バックエンド (API) に Push します。（GUIが起動します） | `python gui.py` |
| **`main.py`** | **【常駐・自動更新用】** （開発中）MT5 のエクスポートファイルを監視し、更新があれば自動的に Hono へ Push するバックグラウンドエンジンです。 | `python main.py` |
| **`market_analyzer.py`** | **【コアロジック】** 価格と指標の統合、米国夏時間/冬時間の動的オフセット補正、ボラティリティ計算などを担うクラス群です。（直接実行はしません） | - |

---

## 🚀 初期データの流し込み手順 (Data Seeding)

Cloudflare D1 には、API 経由での大量のデータ送信（10MB以上）に制限があります。
そのため、**初回セットアップ時** は以下の手順で CSV を生成し、コマンドラインから一括インポートを行います。

### 1. CSV ファイルの生成 (Windows環境)
MT5 のチャートを開いた状態で、以下のコマンドを実行します。
```bash
# 過去3年分のデータを取得し、CSVとして出力
python sync_direct.py --years 3 --mode csv
```
処理が完了すると、`seed_data/` フォルダの中に `price_candles.csv` などのインポート用ファイルが 5 つ生成されます。

### 2. Cloudflare D1 へのインポート (ターミナル)
生成された CSV を、`wrangler` コマンドを使って本番データベースに流し込みます。
※ プロジェクトのルートディレクトリ (`apps/backend`) で実行してください。

```bash
# 1分足チャートデータ (最も時間がかかります)
bunx wrangler d1 import gold-vola-db --remote --table price_candles ../analytics/seed_data/price_candles.csv

# 経済指標データ
bunx wrangler d1 import gold-vola-db --remote --table economic_events ../analytics/seed_data/economic_events.csv

# セッション分析結果
bunx wrangler d1 import gold-vola-db --remote --table session_volatilities ../analytics/seed_data/session_volatilities.csv

# 地合いの閾値
bunx wrangler d1 import gold-vola-db --remote --table session_thresholds ../analytics/seed_data/session_thresholds.csv

# 生の価格データ
bunx wrangler d1 import gold-vola-db --remote --table prices ../analytics/seed_data/prices.csv
```

## ⚙️ 依存関係
- `MetaTrader5`: MT5 との通信用
- `pandas`, `numpy`: データ解析用
- `pytz`: タイムゾーン処理用

(詳細は `requirements.txt` を参照してください)
