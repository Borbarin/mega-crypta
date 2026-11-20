import { formatCompactUsd, formatPercent, formatPlainPercent, formatUsd } from '../lib/format';
import { useMarketStore } from '../store/useMarketStore';
import { SafeText } from './SafeText';
import { MetricSkeleton } from './Skeleton';

const METRICS = [
  {
    key: 'totalMarketCap',
    label: 'Капитализация',
    format: formatCompactUsd,
    title: formatUsd,
  },
  {
    key: 'change24h',
    label: 'Изменение за 24 ч',
    format: formatPercent,
    tone: true,
  },
  {
    key: 'totalVolume',
    label: 'Объём торгов',
    format: formatCompactUsd,
    title: formatUsd,
  },
  {
    key: 'btcDominance',
    label: 'Доминация BTC',
    format: formatPlainPercent,
  },
];

function toneClass(value) {
  if (typeof value !== 'number' || value === 0) return '';
  return value > 0 ? 'up' : 'down';
}

export function MetricCards() {
  const global = useMarketStore((state) => state.global);
  const status = useMarketStore((state) => state.status);

  if (!global && status === 'loading') return <MetricSkeleton />;
  if (!global) return null;

  const cards = METRICS.flatMap((metric) => {
    const raw = global[metric.key];
    const text = metric.format(raw);
    if (text == null) return [];
    return [{ ...metric, raw, text, full: metric.title ? metric.title(raw) : null }];
  });

  if (!cards.length) return null;

  return (
    <section className="metrics" aria-label="Метрики рынка">
      {cards.map((card) => (
        <article className="card metric" key={card.key} title={card.full ?? undefined}>
          <p className="metric-label">{card.label}</p>
          <p className={`metric-value num ${card.tone ? toneClass(card.raw) : ''}`.trim()}>
            <SafeText value={card.text} />
          </p>
        </article>
      ))}
    </section>
  );
}
