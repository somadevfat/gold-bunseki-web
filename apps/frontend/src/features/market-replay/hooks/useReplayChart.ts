import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  CandlestickData,
  Time,
  ISeriesApi,
  createSeriesMarkers,
  IChartApi,
} from 'lightweight-charts';
import type { Candle } from '@/lib/api/client';

interface ReplayChartParams {
  candles: Candle[];
  exactEventTimeJst?: string;
}

/**
 * useReplayChart は軽量チャート（lightweight-charts）の初期化とデータ更新を管理するカスタムフックです。
 * @responsibility チャートのライフサイクル管理、データのフォーマット、発表時刻マーカーの描画。
 */
export function useReplayChart({ candles, exactEventTimeJst }: ReplayChartParams) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    /* チャート本体の初期化 */
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#787774',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: 'transparent' },
        horzLines: { color: '#f5f5f5' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 480,
      timeScale: {
        borderColor: '#f0f0f0',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: '#f0f0f0',
        autoScale: true,
      },
      handleScroll: true,
      handleScale: true,
    });

    /* ローソク足シリーズの追加 */
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    /* データの整形とセット */
    const formattedData: CandlestickData<Time>[] = [...candles]
      .sort((a, b) => new Date(a.datetimeJst).getTime() - new Date(b.datetimeJst).getTime())
      .map((c) => ({
        time: (new Date(c.datetimeJst).getTime() / 1000) as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

    candlestickSeries.setData(formattedData);
    chart.timeScale().fitContent();

    /* 経済指標発表時刻のマーカー描画 */
    if (exactEventTimeJst) {
      const targetTime = new Date(exactEventTimeJst).getTime();
      const markerTime = (targetTime / 1000) as Time;
      const exists = formattedData.some((d) => d.time === markerTime);

      if (exists) {
        createSeriesMarkers(candlestickSeries, [
          {
            time: markerTime,
            position: 'aboveBar',
            color: '#3b82f6',
            shape: 'arrowDown',
            text: '発表時刻',
            size: 1.5,
          },
        ]);
      }
    }

    /* リサイズ対応 */
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    /* クリーンアップ */
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [candles, exactEventTimeJst]);

  return {
    chartContainerRef,
  };
}