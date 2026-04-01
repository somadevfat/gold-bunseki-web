import { useRouter, useSearchParams } from 'next/navigation';

/**
 * useIndicatorSelection は経済指標の選択状態（URLパラメータ）を管理するカスタムフックです。
 * @responsibility URLパラメータの読み取りと更新、ナビゲーション制御。
 */
export function useIndicatorSelection(defaultEvent = 'ISM製造業') {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentEvent = searchParams.get('event') || defaultEvent;

  /* 指標が選択された際のURL更新処理 */
  const selectIndicator = (eventValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('event', eventValue);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return {
    currentEvent,
    selectIndicator,
  };
}
