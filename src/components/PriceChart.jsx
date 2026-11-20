import { useEffect, useRef } from 'react';
import { Chart } from '../lib/chartSetup';
import { formatChartLabel, formatUsd } from '../lib/format';
import { Spinner } from './Skeleton';

export function PriceChart({ points, timeframe, loading }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!points.length) {
      chartRef.current?.destroy();
      chartRef.current = null;
      return;
    }

    const labels = points.map((point) => formatChartLabel(point.ts, timeframe));
    const values = points.map((point) => point.value);
    const rising = values.length < 2 || values[values.length - 1] >= values[0];
    const borderColor = rising ? '#0c7a45' : '#c0362c';
    const backgroundColor = rising ? 'rgba(12, 122, 69, 0.14)' : 'rgba(192, 54, 44, 0.12)';

    if (!chartRef.current) {
      try {
        chartRef.current = new Chart(canvas, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                data: values,
                borderColor,
                backgroundColor,
                fill: true,
                tension: 0.25,
                pointRadius: 0,
                pointHoverRadius: 4,
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            interaction: { mode: 'index', intersect: false },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label(context) {
                    return formatUsd(context.parsed.y) ?? '';
                  },
                },
              },
            },
            scales: {
              x: {
                ticks: { maxTicksLimit: 6, color: '#5c6b78' },
                grid: { display: false },
              },
              y: {
                ticks: {
                  color: '#5c6b78',
                  callback(value) {
                    return formatUsd(Number(value)) ?? '';
                  },
                },
                grid: { color: 'rgba(23, 33, 43, 0.08)' },
              },
            },
          },
        });
      } catch {
        chartRef.current = null;
      }
      return;
    }

    const chart = chartRef.current;
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.data.datasets[0].borderColor = borderColor;
    chart.data.datasets[0].backgroundColor = backgroundColor;
    chart.update();
  }, [points, timeframe]);

  useEffect(() => () => {
    chartRef.current?.destroy();
    chartRef.current = null;
  }, []);

  return (
    <div className="card chart-frame">
      {!points.length && loading ? <div className="skeleton chart-skeleton" /> : null}
      {!points.length && !loading ? <p className="chart-empty">Нет исторических данных</p> : null}
      {points.length && loading ? (
        <div className="chart-overlay">
          <Spinner label="График" />
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        className={points.length ? 'chart-canvas' : 'chart-canvas is-hidden'}
        role="img"
        aria-label="График изменения цены"
      />
    </div>
  );
}
