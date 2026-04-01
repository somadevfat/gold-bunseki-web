import { getReplayData } from '../api/getReplayData';
import ReplaySection from './ReplaySection';

interface ReplayAreaProps {
  eventName: string;
  displayEventName: string;
}

/**
 * ReplayArea は特定指標の再現データ表示領域を管理するRSCコンポーネントです。
 * @responsibility RSCとしてデータを取得し、データが存在しない場合のメッセージ表示、またはReplaySectionの表示を行う。
 */
export async function ReplayArea({ eventName, displayEventName }: ReplayAreaProps) {
  const data = await getReplayData(eventName);

  if (!data || (!data.candles?.length && !data.historicalStats?.length)) {
    return (
      <div className="py-24 border border-dashed border-slate-200 rounded-lg text-center bg-slate-50/20 px-4">
        <span className="text-4xl mb-4 opacity-50 block">📭</span>
        <p className="text-slate-700 text-lg font-bold mb-2">データが存在しません</p>
        <p className="text-slate-500 text-sm max-w-lg mx-auto leading-relaxed">
          「{displayEventName}」に関するチャートデータ、および過去の統計データが見つかりませんでした。
          <br />
          MT5から経済指標が取得できないか、まだ一度もこの指標が発表されていない期間を分析している可能性があります。
          <br />
          ※下の「Session Fact Timeline」で価格の動き自体は確認できます。
        </p>
      </div>
    );
  }

  return <ReplaySection data={data} eventName={displayEventName} />;
}
