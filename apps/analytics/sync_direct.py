import MetaTrader5 as mt5
import pandas as pd
from market_analyzer import MarketAnalyzer
import sys

# ==========================================
# 1. 接続設定
# ==========================================
SYMBOL = "GOLD"        # あなたのMT5での銘柄名に合わせてください (XAUUSD等)
FETCH_COUNT = 10000    # 直近何本の1分足を同期するか（初回は多め、2回目以降は少なめでOK）

def sync_from_mt5():
    # MT5に接続
    if not mt5.initialize():
        print("❌ MT5への接続に失敗しました。MT5が起動しているか確認してください。")
        return

    print(f"✅ MT5接続成功 (Version: {mt5.version()})")

    try:
        # --- (A) 1分足データの取得 ---
        print(f"📥 {SYMBOL} の1分足を {FETCH_COUNT} 本取得中...")
        rates = mt5.copy_rates_from_pos(SYMBOL, mt5.TIMEFRAME_M1, 0, FETCH_COUNT)
        if rates is None or len(rates) == 0:
            print(f"❌ {SYMBOL} のデータ取得に失敗しました。銘柄名が正しいか確認してください。")
            return

        # MT5のデータを分析用DataFrameに変換
        price_df = pd.DataFrame(rates)
        price_df['Datetime'] = pd.to_datetime(price_df['time'], unit='s')
        
        # MarketAnalyzerが期待する形式（OPEN, HIGH, LOW, CLOSE）にマッピング
        price_df = price_df.rename(columns={
            'open': 'OPEN', 'high': 'HIGH', 'low': 'LOW', 'close': 'CLOSE'
        })
        # ここではMT5のサーバー時間をそのまま使い、Analyzer内のオフセット(+7等)でJSTに変換させます
        price_df['Datetime_JST'] = price_df['Datetime'] 
        price_df.set_index('Datetime_JST', inplace=True)
        price_df = price_df[['OPEN', 'HIGH', 'LOW', 'CLOSE']]

        # --- (B) 指標データの取得 ---
        print("📥 経済指標カレンダー（USD）を取得中...")
        # 直近1年〜未来1ヶ月の指標を取得
        from datetime import datetime, timedelta
        utc_from = datetime.utcnow() - timedelta(days=365)
        utc_to = datetime.utcnow() + timedelta(days=30)
        
        calendar_data = mt5.calendar_get(datetime_from=utc_from, datetime_to=utc_to, country="US")
        if calendar_data is None:
            print("⚠️ 指標データの取得に失敗しました。")
            calendar_df = pd.DataFrame()
        else:
            calendar_df = pd.DataFrame(calendar_data)
            # Analyzerが期待するカラム名へ調整
            calendar_df = calendar_df.rename(columns={
                'name': 'EventName', 'time': 'Time', 'importance': 'Importance',
                'actual': 'Actual', 'forecast': 'Forecast', 'prev': 'Prev'
            })
            # Importanceの数値をテキストに変更 (1:LOW, 2:MID, 3:HIGH)
            calendar_df['Importance'] = calendar_df['Importance'].map({1: 'LOW', 2: 'MID', 3: 'HIGH'})
            # TimeをDatetime形式に変換
            calendar_df['Time'] = pd.to_datetime(calendar_df['Time'], unit='s')
            calendar_df['Datetime_JST'] = calendar_df['Time']

        # --- (C) DBへ流し込み (既存のロジックを流用) ---
        print("🔄 解析およびデータベースへの保存を開始...")
        analyzer = MarketAnalyzer(xm_to_jst_offset_hours=7) # 冬時間は7、夏時間は6
        
        # 解析（セッション分割と地合い判定の紐付け）
        result_df = analyzer.analyze_sessions(price_df, calendar_df)
        
        # DBへ保存
        analyzer.save_to_db(result_df, calendar_df, price_df)
        
        print("\n✨ 【同期完了】MT5の最新データでアプリが更新されました ✅")

    finally:
        mt5.shutdown()

if __name__ == "__main__":
    sync_from_mt5()
