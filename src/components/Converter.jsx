import { useState } from 'react';
import { useConversion } from '../hooks/useConversion';
import { formatBtc, formatEur, formatUsd } from '../lib/format';
import { useCoinStore } from '../store/useCoinStore';
import { SafeText } from './SafeText';
import { Skeleton } from './Skeleton';

const ROWS = [
  { key: 'usd', label: 'USD', format: formatUsd },
  { key: 'eur', label: 'EUR', format: formatEur },
  { key: 'btc', label: 'BTC', format: formatBtc },
];

export function Converter() {
  const [amount, setAmount] = useState('1');
  const result = useConversion(amount);
  const quoteLoading = useCoinStore((state) => state.quoteLoading);
  const visible = ROWS.filter((row) => result[row.key] != null);

  return (
    <section className="card converter">
      <h2>Пересчёт</h2>
      <label className="field">
        <span>Количество монет</span>
        <input
          id="convert-amount"
          type="text"
          inputMode="decimal"
          value={amount}
          autoComplete="off"
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>

      {result.invalid ? <p className="hint">Введите количество нулём или больше.</p> : null}

      {quoteLoading && visible.length === 0 ? (
        <div className="converter-grid" aria-hidden="true">
          <Skeleton className="skeleton-line tall" />
          <Skeleton className="skeleton-line tall" />
          <Skeleton className="skeleton-line tall" />
        </div>
      ) : null}

      {visible.length > 0 ? (
        <dl className="converter-grid">
          {visible.map((row) => (
            <div key={row.key}>
              <dt>{row.label}</dt>
              <dd className="num">
                <SafeText value={row.format(result[row.key])} />
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {!quoteLoading && !result.invalid && !result.empty && visible.length === 0 ? (
        <p className="hint">Нет курсов для пересчёта.</p>
      ) : null}
    </section>
  );
}
