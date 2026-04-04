import MetaTrader5 as mt5
import pandas as pd
from market_analyzer import MarketAnalyzer
import argparse
import sys
from pathlib import Path

# ==========================================
# 1. 接続設定
# ==========================================
SYMBOL = "GOLD"        # あなたのMT5での銘柄名に合わせてください (XAUUSD等)

def sync_from_mt5(years: int, mode: str):
    # MT5に接続
    if not mt5.initialize():
        print("❌ MT5への接続に失敗しました。MT5が起動しているか確認してください。")
        return

    print(f"✅ MT5接続成功 (Version: {mt5.version()})")

    try:
        # --- (A) 1分足データの取得 (期間指定) ---
        from datetime import datetime, timedelta, timezone
        dt_to = datetime.now()
        dt_from = dt_to - timedelta(days=years * 365)
        
        print(f"📥 {SYMBOL} の1分足を {dt_from} から {dt_to} まで取得中...")
        rates = mt5.copy_rates_range(SYMBOL, mt5.TIMEFRAME_M1, dt_from, dt_to)
        
        if rates is None or len(rates) == 0:
            print(f"❌ {SYMBOL} のデータ取得に失敗しました。取得可能期間を確認してください。")
            return

        print(f"✅ {len(rates)} 本のデータを取得しました。")
        # MT5のデータを分析用DataFrameに変換
        price_df = pd.DataFrame(rates)
        price_df['Datetime'] = pd.to_datetime(price_df['time'], unit='s')
        
        # MarketAnalyzerが期待する形式にマッピング
        price_df = price_df.rename(columns={
            'open': 'OPEN', 'high': 'HIGH', 'low': 'LOW', 'close': 'CLOSE'
        })
        
        # --- 動的な時差補正 (冬+7, 夏+6) ---
        analyzer = MarketAnalyzer() 
        offsets = price_df['Datetime'].apply(analyzer.get_jst_offset)
        price_df['Datetime_JST'] = price_df['Datetime'] + pd.to_timedelta(offsets, unit='h')
        
        price_df.set_index('Datetime_JST', inplace=True)
        price_df = price_df[['OPEN', 'HIGH', 'LOW', 'CLOSE']]

        # --- (B) 指標データの取得 (期間指定) ---
        print(f"📥 過去 {years} 年分 + 未来 30 日の経済指標カレンダーを取得中...")
        utc_from = datetime.now(timezone.utc) - timedelta(days=years * 365)
        utc_to = datetime.now(timezone.utc) + timedelta(days=30)
        
        calendar_data = mt5.calendar_get(datetime_from=utc_from, datetime_to=utc_to, country="US")
        if calendar_data is None or len(calendar_data) == 0:
            print("⚠️ 指標データの取得に失敗しました。")
            calendar_df = pd.DataFrame()
        else:
            calendar_df = pd.DataFrame(calendar_data)
            calendar_df = calendar_df.rename(columns={
                'name': 'EventName', 'time': 'Time', 'importance': 'Importance',
                'actual': 'Actual', 'forecast': 'Forecast', 'prev': 'Prev'
            })
            calendar_df['Importance'] = calendar_df['Importance'].map({1: 'LOW', 2: 'MEDIUM', 3: 'HIGH'})
            calendar_df['Time'] = pd.to_datetime(calendar_df['Time'], unit='s')
            calendar_df['Datetime_JST'] = calendar_df['Time'] + pd.Timedelta(hours=9)
            print(f"✅ {len(calendar_df)} 件の指標を取得しました。")

        # --- (C) 解析および出力 ---
        print(f"🔄 解析開始 (データ量に基づき時間がかかる場合があります)...")
        analyzer = MarketAnalyzer(xm_to_jst_offset_hours=7) 
        
        # 解析
        result_df = analyzer.analyze_sessions(price_df, calendar_df)
        
        if mode == 'csv':
            analyzer.export_to_d1_csv(result_df, calendar_df, price_df)
        else:
            print("❌ Push モードはこのデータ量では非推奨です。--mode csv を使用してください。")

        print("\n✨ 【完了】3年分のデータ準備が整いました。")

    finally:
        mt5.shutdown()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='MT5 Data Seed Script (Bulk)')
    parser.add_argument('--years', type=int, default=3, help='Number of years to fetch')
    parser.add_argument('--mode', type=str, choices=['csv'], default='csv', help='Execution mode')
    args = parser.parse_args()

    sync_from_mt5(years=args.years, mode=args.mode)
