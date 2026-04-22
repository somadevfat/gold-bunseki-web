/**
 * PropertyItem は指標プロパティの表示項目UIコンポーネントです。
 * @responsibility ラベル・値・サブ値のペアをセマンティックに表示する。
 * @param label 項目名ラベル（英語、大文字スタイルで表示）
 * @param value メインの表示値
 * @param subValue サブ情報（セッション名など）
 * @param highlight 強調表示フラグ
 * @param isStatus ステータスドット（●）を表示するフラグ
 */
/** PropertyItem コンポーネントのプロパティ定義 */
export interface PropertyItemProps {
  label: string;
  value: string;
  subValue?: string;
  highlight?: boolean;
  isStatus?: boolean;
}

export function PropertyItem({
  label,
  value,
  subValue,
  highlight,
  isStatus,
}: PropertyItemProps) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex flex-wrap items-baseline gap-3">
        <p
          className={`text-xl font-bold tracking-tight ${
            highlight ? "text-slate-900 border-b-2 border-slate-100 pb-1" : "text-slate-700"
          } ${isStatus ? "flex items-center gap-2" : ""}`}
        >
          {isStatus && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
          {value}
        </p>
        {subValue && (
          <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}
