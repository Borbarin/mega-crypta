import { formatPercent, formatUsd } from '../lib/format';
import { SafeText } from './SafeText';

function SummaryCard({ label, value, tone = '' }) {
  if (value == null) return null;

  return (
    <article className="card metric">
      <p className="metric-label">{label}</p>
      <p className={`metric-value num ${tone}`.trim()}>
        <SafeText value={value} />
      </p>
    </article>
  );
}

function toneOf(value) {
  if (typeof value !== 'number' || value === 0) return '';
  return value > 0 ? 'up' : 'down';
}

function genitivePositions(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'позиции';
  return 'позиций';
}

export function PortfolioSummary({ view }) {
  const valueLabel = view.missingPrices > 0 ? 'Текущая стоимость (с ценой)' : 'Текущая стоимость';
  const pnlLabel = view.missingPrices > 0 ? 'PnL (с ценой)' : 'Прибыль / убыток';

  return (
    <section aria-label="Итоги портфеля">
      <div className="metrics">
        <SummaryCard label="Вложено" value={formatUsd(view.invested)} />
        <SummaryCard label={valueLabel} value={formatUsd(view.currentValue)} />
        <SummaryCard label={pnlLabel} value={formatUsd(view.pnl)} tone={toneOf(view.pnl)} />
        <SummaryCard label="PnL, %" value={formatPercent(view.pnlPercent)} tone={toneOf(view.pnlPercent)} />
      </div>
      {view.missingPrices > 0 ? (
        <p className="hint">
          Нет актуальной цены для {view.missingPrices} {genitivePositions(view.missingPrices)}.
          Они не входят в стоимость и PnL.
        </p>
      ) : null}
    </section>
  );
}
