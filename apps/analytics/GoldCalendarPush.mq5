//+------------------------------------------------------------------+
//| GoldCalendarPush.mq5                                             |
//| @responsibility: MT5の経済指標カレンダー(USD)を取得し、               |
//|                  Python監視対象の共通フォルダ(FILE_COMMON)に保存する。|
//|                  1時間ごとに自動更新する。                            |
//+------------------------------------------------------------------+
#property copyright "Gold Vola Bunseki"
#property version   "2.00"
#property description "米国経済指標カレンダーをファイルに出力するEA"
#property strict

//--- 入力パラメータ
input int    InpDaysBack    = 365;                     // 取得する過去の日数
input int    InpDaysFuture  = 30;                      // 取得する未来の日数（今後の指標も送信）
input int    InpUpdateHours = 1;                       // 更新頻度（時間）

// 出力ファイル名
const string OUT_FILENAME = "gold_calendar_cache.json";

//+------------------------------------------------------------------+
//| EA初期化                                                           |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("====================================================");
   Print("[GoldCalendarPush] EAを初期化しました（ファイル出力モード）。");
   Print("[GoldCalendarPush] 出力ファイル: ", TerminalInfoString(TERMINAL_COMMONDATA_PATH), "\\Files\\", OUT_FILENAME);
   Print("[GoldCalendarPush] 取得期間: 過去", InpDaysBack, "日 ～ 未来", InpDaysFuture, "日");
   Print("====================================================");

   // 1時間ごとにタイマー設定
   EventSetTimer(InpUpdateHours * 3600);

   /* 最初のアタッチ時にも即時実行 */
   WriteCalendarData();

   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| EA終了時の処理                                                     |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   Print("[GoldCalendarPush] EAをデタッチしました。(reason=", reason, ")");
}

//+------------------------------------------------------------------+
//| タイマー処理                                                       |
//+------------------------------------------------------------------+
void OnTimer()
{
   WriteCalendarData();
}

//+------------------------------------------------------------------+
//| カレンダーデータ取得 & 共通フォルダへJSON出力                          |
//+------------------------------------------------------------------+
void WriteCalendarData()
{
   datetime dt_from = TimeCurrent() - (datetime)((long)InpDaysBack  * 86400);
   datetime dt_to   = TimeCurrent() + (datetime)((long)InpDaysFuture * 86400);

   Print("[GoldCalendarPush] 全世界のカレンダー指標を取得中...");

   MqlCalendarValue values[];
   // 国コード(country_code) と 通貨(currency) を NULL に設定して、
   // 米国以外の全経済指標も一括で取得するように変更。
   int count = CalendarValueHistory(values, dt_from, dt_to, NULL, NULL);

   if(count < 0)
   {
      Print("[GoldCalendarPush] ❌ CalendarValueHistory() 失敗 - エラーコード: ", GetLastError());
      return;
   }
   if(count == 0)
   {
      Print("[GoldCalendarPush] ⚠ 取得件数0件。MT5のカレンダー画面を一度開いて同期させてください。");
      return;
   }

   // ファイル出力 (全MT5共通のAppDataフォルダ)
   int handle = FileOpen(OUT_FILENAME, FILE_WRITE | FILE_TXT | FILE_ANSI | FILE_COMMON);
   if(handle == INVALID_HANDLE)
   {
      Print("[GoldCalendarPush] ❌ ファイル出力失敗 - エラーコード: ", GetLastError());
      return;
   }

   FileWriteString(handle, "[");
   bool first = true;
   int  skipped = 0;

   for(int i = 0; i < count; i++)
   {
      MqlCalendarEvent ev;
      if(!CalendarEventById(values[i].event_id, ev))
      {
         skipped++;
         continue;
      }

      string importance = "LOW";
      if(ev.importance == CALENDAR_IMPORTANCE_HIGH)
         importance = "HIGH";
      else if(ev.importance == CALENDAR_IMPORTANCE_MODERATE)
         importance = "MEDIUM";

      string actual   = "null";
      string forecast = "null";
      string prev_val = "null";

      if(values[i].actual_value   != LONG_MIN)
         actual   = DoubleToString((double)values[i].actual_value   / 1000000.0, 6);
      if(values[i].forecast_value != LONG_MIN)
         forecast = DoubleToString((double)values[i].forecast_value / 1000000.0, 6);
      if(values[i].prev_value     != LONG_MIN)
         prev_val = DoubleToString((double)values[i].prev_value     / 1000000.0, 6);

      string name = ev.name;
      StringReplace(name, "\\", "\\\\");
      StringReplace(name, "\"", "\\\"");

      string dt_str = TimeToString(values[i].time, TIME_DATE | TIME_MINUTES);
      StringReplace(dt_str, ".", "-");   
      StringReplace(dt_str, " ", "T");   
      dt_str += ":00";

      string json_item = "";
      if(!first) json_item += ",";
      first = false;

      json_item += "{";
      json_item += "\"event_id\":"    + IntegerToString(values[i].event_id) + ",";
      json_item += "\"time\":\""      + dt_str + "\",";
      json_item += "\"name\":\""      + name + "\",";
      json_item += "\"importance\":\"" + importance + "\",";
      json_item += "\"actual\":"      + actual + ",";
      json_item += "\"forecast\":"    + forecast + ",";
      json_item += "\"prev\":"        + prev_val;
      json_item += "}";

      FileWriteString(handle, json_item);
   }

   FileWriteString(handle, "]");
   FileClose(handle);
   Print("[GoldCalendarPush] ✅ カレンダー保存成功 (", (count - skipped), "件 / ", count, "件中) -> ", OUT_FILENAME);
}
