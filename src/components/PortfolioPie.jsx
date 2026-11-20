import { useEffect, useRef } from 'react';
import { Chart } from '../lib/chartSetup';
import { formatUsd } from '../lib/format';

const COLORS = ['#0b6e75', '#c46b2c', '#1f4e79', '#7a8f4a', '#8c3d4e', '#3d6b8c', '#b0893e', '#4d6b5a'];

export function PortfolioPie({ slices }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !slices.length) return;

    const labels = slices.map((slice) => `${slice.name}: ${slice.share.toFixed(1)} %`);
    const data = slices.map((slice) => slice.value);
    const colors = slices.map((_, index) => COLORS[index % COLORS.length]);

    const tooltipLabel = (context) => {
      const slice = slices[context.dataIndex];
      const money = formatUsd(slice?.value) ?? '';
      const share = typeof slice?.share === 'number' ? `${slice.share.toFixed(1)} %` : '';
      return `${money} (${share})`;
    };

    if (!chartRef.current) {
      try {
        chartRef.current = new Chart(canvas, {
          type: 'pie',
          data: {
            labels,
            datasets: [
              {
                data,
                backgroundColor: colors,
                borderColor: '#ffffff',
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#17212b', boxWidth: 12, padding: 14 },
              },
              tooltip: { callbacks: { label: tooltipLabel } },
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
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = colors;
    chart.options.plugins.tooltip.callbacks.label = tooltipLabel;
    chart.update();
  }, [slices]);

  useEffect(() => () => {
    chartRef.current?.destroy();
    chartRef.current = null;
  }, []);

  return (
    <section className="card pie-card">
      <h2>Структура портфеля</h2>
      <div className="pie-frame">
        <canvas ref={canvasRef} role="img" aria-label="Доли монет в портфеле" />
      </div>
    </section>
  );
}
