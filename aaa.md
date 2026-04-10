MetaTrader 5 (MT5) 本体や、Python の MetaTrader5 ライブラリは Windows 専用のツールであるため、残念ながら私の方で直接 MQL5
を実行したり、Python の generate_seed_csv.py を実行して MT5
からデータを取得することができません。（ここで実行しようとすると「MT5が見つからない」というエラーになってしまいます）

そのため、大変お手数ですが、以下の作業は「MT5 がインストールされているご自身の Windows
PC」上で実行していただく必要があります。

Windows PC 側でやっていただく手順

1. MQL5（EA）で JSON を出力する

- Windows の MT5 を開き、GoldCalendarPush.mq5 をチャートにアタッチしてください。
- （これにより、裏側で %APPDATA%\MetaQuotes\Terminal\Common\Files\gold_calendar_cache.json
  に全世界の経済指標データが出力されます）

2. Python で CSV を生成する

- Windows 側のターミナル（コマンドプロンプトや PowerShell）を開き、プロジェクトのディレクトリに移動します。
- 以下のコマンドを実行して、MQL5のJSONと価格データをマージし、CSVを生成します。

1 cd apps/analytics
2 # 仮想環境を有効化 (まだの場合は python -m venv venv などを実行)
3 .\venv\Scripts\activate
4
5 # シード用スクリプトを実行
6 python scripts/generate_seed_csv.py --count 1500000

これが成功すると、手元のPCの apps/analytics/seed_data/ フォルダに CSV ファイル群が書き出されます。

CSVが手元に出力できたら、次はそれをPostgreSQL（DockerまたはVPS）へ流し込む作業になります。
Windows側でスクリプトは無事に実行できそうでしょうか？もしエラーなどが出た場合は、そのエラー内容を教えていただければすぐに
修正・サポートいたします！
