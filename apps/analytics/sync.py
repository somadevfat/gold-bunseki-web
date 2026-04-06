import MetaTrader5 as mt5
import pandas as pd
from market_analyzer import MarketAnalyzer
import requests
import sys

# ==========================================
# 1. 接続設定 (常用同期用)
# ==========================================
SYMBOL = "GOLD"        # 対象銘柄
FETCH_COUNT = 500      # 差分同期なので直近数百本だけでOK
API_URL = "http://localhost:3000/api/v1/sync/data" # 常用(差分)エンドポイント

def sync_from_mt5():
    print("====================================================")
    print("🔄 [Sync Mode] 直近データの差分同期を開始します")
    print(f"対象銘柄: {SYMBOL} / 取得予定件数: {FETCH_COUNT}本")
    print("====================================================")

    if not mt5.initialize():
        print("[Error] MT5への接続に失敗しました。MT5が起動しているか確認してください。")
        sys.exit(1)

    try:
        # --- (A) 1分足データの取得 ---
        print(f"[Info] MT5から {SYMBOL} の直近1分足を取得中...")
        rates = mt5.copy_rates_from_pos(SYMBOL, mt5.TIMEFRAME_M1, 0, FETCH_COUNT)
        if rates is None or len(rates) == 0:
            print(f"❌ {SYMBOL} のデータ取得に失敗しました。")
            return

        price_df = pd.DataFrame(rates)
        price_df['Datetime'] = pd.to_datetime(price_df['time'], unit='s')
        price_df = price_df.rename(columns={'open': 'OPEN', 'high': 'HIGH', 'low': 'LOW', 'close': 'CLOSE'})
        price_df['Datetime_JST'] = price_df['Datetime'] 
        price_df.set_index('Datetime_JST', inplace=True)
        price_df = price_df[['OPEN', 'HIGH', 'LOW', 'CLOSE']]

        # --- (B) 経済指標データ（カレンダー）の読み込み ---
        # 以前追加した 'auto' 機能を使って、MQL5が出力した共通JSONを探しに行きます。
        analyzer = MarketAnalyzer(xm_to_jst_offset_hours=7)
        calendar_df = analyzer.load_calendar_data('auto')

        # --- (C) 解析と差分APIへの送信 ---
        print("[Info] セッション解析を開始します...")
        result_df = analyzer.analyze_sessions(price_df, calendar_df)
        payload = analyzer.prepare_api_payload(result_df, calendar_df, price_df)
        
        print(f"[Info] Honoサーバー (Sync API: {API_URL}) へ送信中...")
        response = requests.post(API_URL, json=payload, timeout=30)
        
        if response.status_code == 200:
            print("\n[Done] 🚀 【同期完了】MT5の最新データでバックエンドが更新されました！")
        else:
            print(f"\n[Error] 同期に失敗しました: HTTP {response.status_code} - {response.text}")

    except Exception as e:
        print(f"\n[Error] 予期せぬエラーが発生しました: {e}")
    finally:
        mt5.shutdown()

if __name__ == "__main__":
    sync_from_mt5()
