import pandas as pd
import numpy as np
import psycopg2
from psycopg2.extras import execute_values
from pathlib import Path
from pytz import timezone


class MarketAnalyzer:
    """
    ボラティリティの時間枠（セッション区分）と経済指標を紐付けるコアエンジン。
    @responsibility: XMの価格データおよび指標データを時差補正し、指定された時間枠ごとに
                     ボラティリティを算出・統合する。パーセンタイルによる地合い閾値も計算する。
    """

    # ボラティリティ期間（セッション区分）の定義 (JST基準)
    SESSION_BINS = [
        ("00:00", "03:00", "NY_Mid"),
        ("03:00", "06:00", "NY_Close"),
        ("07:00", "09:00", "Oceania"),
        ("09:00", "12:00", "Tokyo_AM"),
        ("12:00", "16:00", "Tokyo_PM"),
        ("16:00", "21:00", "London"),
        ("21:00", "24:00", "NY_Open"),
    ]

    def __init__(self, xm_to_jst_offset_hours: int = 7, db_config: dict = None):
        """
        @param xm_to_jst_offset_hours: XMのサーバー時間からJSTへのオフセット（冬時間は+7、夏時間は+6）
        @param db_config: DB接続情報の辞書
        """
        self.offset = xm_to_jst_offset_hours
        self.jst_tz = timezone('Asia/Tokyo')
        self.db_config = db_config or {
            "host": "localhost",
            "port": "5432",
            "user": "user",
            "password": "password",
            "dbname": "gold_vola_db"
        }

    # ===========================================================================
    # データロード系
    # ===========================================================================

    def load_price_data(self, csv_path: str) -> pd.DataFrame:
        """
        XMから出力された1分足の価格データ(タブ区切り)を読み込み、JSTへ変換する。
        @param csv_path: 1分足CSVのパス
        @return: 時系列価格データのDataFrame (JSTインデックス)
        """
        print(f"[Core] 価格データのロード開始: {csv_path}")
        df = pd.read_csv(csv_path, sep='\t', skipinitialspace=True)

        # カラム名のクレンジング (<DATE> -> DATE)
        df.columns = [c.strip('<> ') for c in df.columns]

        # Datetime作成 (YYYY.MM.DD HH:MM:SS)
        datetime_str = df['DATE'] + ' ' + df['TIME']
        df['Datetime'] = pd.to_datetime(datetime_str, format='%Y.%m.%d %H:%M:%S')

        # XM時間に対してオフセットを足して「強制的にJST時刻」にする
        df['Datetime_JST'] = df['Datetime'] + pd.Timedelta(hours=self.offset)

        df.set_index('Datetime_JST', inplace=True)
        return df[['OPEN', 'HIGH', 'LOW', 'CLOSE']]

    def load_calendar_data(self, csv_path: str) -> pd.DataFrame:
        """
        MQL5から出力した経済指標カレンダーデータを読み込む。
        @param csv_path: 指標CSVのパス
        @return: 経済指標の DataFrame
        """
        print(f"[Core] 経済指標データのロード開始: {csv_path}")
        df = pd.read_csv(csv_path, encoding='cp932')
        df.replace(-9223372036854775808, np.nan, inplace=True)

        # Datetimeの整形
        df['Time'] = pd.to_datetime(df['Time'], format='%Y.%m.%d %H:%M')
        df['Datetime_JST'] = df['Time'] + pd.Timedelta(hours=self.offset)

        return df

    # ===========================================================================
    # 分析系
    # ===========================================================================

    def analyze_sessions(self, price_df: pd.DataFrame, calendar_df: pd.DataFrame) -> pd.DataFrame:
        """
        各日の指定された時間枠（セッションコマ）ごとにボラティリティを算出し、
        経済指標を紐づける。
        @return: セッション単位の集計結果DataFrame
        """
        print("[Core] 時間枠（セッション区分）ごとの分析・紐付けを開始...")

        date_groups = price_df.groupby(price_df.index.date)
        session_results = []

        for current_date, daily_df in date_groups:
            daily_events = calendar_df[calendar_df['Datetime_JST'].dt.date == current_date]

            for start_str, end_str, session_name in self.SESSION_BINS:
                start_time = pd.Timestamp(f"{current_date} {start_str}")
                if end_str == "24:00":
                    end_time = pd.Timestamp(f"{current_date} 23:59:59")
                else:
                    end_time = pd.Timestamp(f"{current_date} {end_str}") - pd.Timedelta(seconds=1)

                mask = (daily_df.index >= start_time) & (daily_df.index <= end_time)
                session_prices = daily_df.loc[mask]

                if session_prices.empty:
                    continue

                session_high = session_prices['HIGH'].max()
                session_low = session_prices['LOW'].min()
                session_vola = session_high - session_low

                event_mask = (daily_events['Datetime_JST'] >= start_time) & (daily_events['Datetime_JST'] <= end_time)
                session_events = daily_events.loc[event_mask]

                event_names = ", ".join(session_events['EventName'].dropna().tolist()) if not session_events.empty else "None"
                has_high_impact = "HIGH" in session_events['Importance'].values if not session_events.empty else False

                session_results.append({
                    "Date": current_date,
                    "SessionName": session_name,
                    "StartTime_JST": start_time.time(),
                    "EndTime_JST": end_time.time(),
                    "SessionHigh": session_high,
                    "SessionLow": session_low,
                    "Volatility_Points": session_vola,
                    "HasEvent": not session_events.empty,
                    "HasHighImpactEvent": has_high_impact,
                    "EventsLinked": event_names
                })

        return pd.DataFrame(session_results)

    def compute_thresholds(self, session_df: pd.DataFrame) -> pd.DataFrame:
        """
        セッション別のボラティリティから大中小の閾値（33/66パーセンタイル）を計算する。
        @responsibility: 固定値ではなく「今の相場環境の中での大中小」を動的に算出する。
        @param session_df: analyze_sessions の戻り値
        @return: セッション別の閾値DataFrame
        """
        print("[Core] 地合い閾値（パーセンタイル）の計算中...")

        # セッションごとに33/66パーセンタイルを算出
        thresholds = (
            session_df.groupby('SessionName')['Volatility_Points']
            .quantile([0.33, 0.66])
            .unstack()
            .rename(columns={0.33: 'small_threshold', 0.66: 'large_threshold'})
            .reset_index()
        )

        session_order = [b[2] for b in self.SESSION_BINS]
        thresholds['SessionName'] = pd.Categorical(
            thresholds['SessionName'], 
            categories=session_order, 
            ordered=True
        )
        thresholds = thresholds.sort_values('SessionName')

        print(thresholds.to_string())
        return thresholds

    def classify_condition(self, vola: float, small_th: float, large_th: float) -> str:
        """
        ボラティリティ値と閾値から地合い（大・中・小）を返す。
        @param vola: ボラティリティ値
        @param small_th: 小の上限（33パーセンタイル）
        @param large_th: 大の下限（66パーセンタイル）
        @return: "small" | "mid" | "large"
        """
        if vola <= small_th:
            return "small"
        elif vola >= large_th:
            return "large"
        else:
            return "mid"

    # ===========================================================================
    # DB保存系
    # ===========================================================================

    def save_to_db(self, session_df: pd.DataFrame, calendar_df: pd.DataFrame, price_df: pd.DataFrame):
        """
        分析結果・指標データ・1分足価格データをDBに一括保存する。
        @param session_df: analyze_sessions の戻り値
        @param calendar_df: load_calendar_data の戻り値
        @param price_df: load_price_data の戻り値（1分足の生データ）
        """
        print(f"[Core] データベース(PostgreSQL)への保存を開始...")

        try:
            conn = psycopg2.connect(**self.db_config)
            cur = conn.cursor()

            # 1. 経済指標データの保存 (economic_events)
            print("  -> 指標データを保存中...")
            event_records = [
                (
                    row['Datetime_JST'],
                    row['EventName'],
                    row['Importance'],
                    row['Actual'] if not pd.isna(row['Actual']) else None,
                    row['Forecast'] if not pd.isna(row['Forecast']) else None,
                    row['Prev'] if not pd.isna(row['Prev']) else None
                )
                for _, row in calendar_df.iterrows()
            ]
            execute_values(cur, """
                INSERT INTO economic_events (datetime_jst, event_name, importance, actual, forecast, prev)
                VALUES %s ON CONFLICT DO NOTHING
            """, event_records)

            # 2. セッションボラティリティデータの保存 (session_volatilities)
            print("  -> セッション別ボラティリティを保存中...")
            session_records = [
                (
                    row['Date'], row['SessionName'], row['StartTime_JST'], row['EndTime_JST'],
                    row['SessionHigh'], row['SessionLow'], row['Volatility_Points'],
                    row['HasEvent'], row['HasHighImpactEvent'], row['EventsLinked']
                )
                for _, row in session_df.iterrows()
            ]
            execute_values(cur, """
                INSERT INTO session_volatilities
                (date, session_name, start_time_jst, end_time_jst, high_price, low_price,
                 volatility_points, has_event, has_high_impact_event, events_linked)
                VALUES %s
                ON CONFLICT (date, session_name) DO UPDATE SET
                    high_price = EXCLUDED.high_price,
                    low_price = EXCLUDED.low_price,
                    volatility_points = EXCLUDED.volatility_points,
                    has_event = EXCLUDED.has_event,
                    has_high_impact_event = EXCLUDED.has_high_impact_event,
                    events_linked = EXCLUDED.events_linked
            """, session_records)

            # 3. 1分足価格データの保存 (price_candles) ← 前回チャート再現用に新規追加
            print("  -> 1分足価格データ（チャート再現用）を保存中...")
            # 各足がどのセッションに属するか判定して一緒に保存
            candle_records = []
            for dt_jst, row in price_df.iterrows():
                session_name = self._get_session_name(dt_jst)
                candle_records.append((
                    dt_jst,
                    session_name,
                    float(row['OPEN']),
                    float(row['HIGH']),
                    float(row['LOW']),
                    float(row['CLOSE'])
                ))

            execute_values(cur, """
                INSERT INTO price_candles (datetime_jst, session_name, open_price, high_price, low_price, close_price)
                VALUES %s ON CONFLICT (datetime_jst) DO NOTHING
            """, candle_records)

            # 4. 地合い閾値の計算と保存 (session_thresholds)
            print("  -> 地合い閾値（パーセンタイル）を計算・保存中...")
            thresholds_df = self.compute_thresholds(session_df)
            threshold_records = [
                (row['SessionName'], row['small_threshold'], row['large_threshold'])
                for _, row in thresholds_df.iterrows()
            ]
            execute_values(cur, """
                INSERT INTO session_thresholds (session_name, small_threshold, large_threshold)
                VALUES %s
                ON CONFLICT (session_name) DO UPDATE SET
                    small_threshold = EXCLUDED.small_threshold,
                    large_threshold = EXCLUDED.large_threshold,
                    calculated_at = CURRENT_TIMESTAMP
            """, threshold_records)

            conn.commit()
            cur.close()
            conn.close()
            print("[Core] DB保存が正常に完了しました！ ✅")

        except Exception as e:
            print(f"[Error] DB保存中にエラーが発生しました: {e}")
            raise e

    def _get_session_name(self, dt: pd.Timestamp) -> str:
        """
        JSTのTimestampからセッション名を返すヘルパー。
        @param dt: JSTのTimestamp
        @return: セッション名 (例: "NY_Open")
        """
        t = dt.time()
        for start_str, end_str, session_name in self.SESSION_BINS:
            start = pd.Timestamp(f"2000-01-01 {start_str}").time()
            end = pd.Timestamp(f"2000-01-01 {'23:59:59' if end_str == '24:00' else end_str}").time()
            if start <= t <= end:
                return session_name
        return "Unknown"


if __name__ == "__main__":
    # テスト動作用
    # 2026年3月上旬は米国冬時間のため、日本(JST+9) - XM冬時間(GMT+2) = 7時間のオフセット
    analyzer = MarketAnalyzer(xm_to_jst_offset_hours=7)

    price_csv = "/home/somah/workspace/gold-vola-bunseki/apps/backend/csv/GOLD_M1_202603020100_202603240245.csv"
    calendar_csv = "/home/somah/workspace/gold-vola-bunseki/apps/backend/csv/USD_Calendar_1Y.csv"

    price_df = analyzer.load_price_data(price_csv)
    calendar_df = analyzer.load_calendar_data(calendar_csv)
    result_df = analyzer.analyze_sessions(price_df, calendar_df)

    # 全データをDBへ一括保存（1分足 + セッション集計 + 指標 + 閾値）
    analyzer.save_to_db(result_df, calendar_df, price_df)

    print("\n----- 【完全同期完了】全データをDBへ保存しました ✅ -----")
    print(result_df.head(10).to_string())
