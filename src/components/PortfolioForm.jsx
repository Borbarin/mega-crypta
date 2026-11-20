import { useLayoutEffect, useRef, useState } from 'react';
import { useAddTransaction } from '../hooks/useAddTransaction';
import { setSafeText } from '../lib/domText';
import { useMarketStore } from '../store/useMarketStore';
import { Skeleton } from './Skeleton';

function CoinOption({ coin }) {
  const ref = useRef(null);
  const label = coin.symbol ? `${coin.name} (${coin.symbol.toUpperCase()})` : coin.name;

  useLayoutEffect(() => {
    setSafeText(ref.current, label);
  });

  return (
    <option ref={ref} value={coin.id}>
      {label}
    </option>
  );
}

export function PortfolioForm() {
  const coins = useMarketStore((state) => state.coins);
  const status = useMarketStore((state) => state.status);
  const addTransaction = useAddTransaction();
  const [coinId, setCoinId] = useState('');
  const [amount, setAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [formError, setFormError] = useState('');

  if (status === 'loading' && coins.length === 0) {
    return (
      <section className="card form-card" aria-hidden="true">
        <Skeleton className="skeleton-line short" />
        <Skeleton className="skeleton-line tall" />
      </section>
    );
  }

  const submit = (event) => {
    event.preventDefault();
    const result = addTransaction({ coinId, amount, buyPrice });
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    setFormError('');
    setAmount('');
    setBuyPrice('');
  };

  return (
    <form className="card form-card" onSubmit={submit}>
      <h2>Новая сделка</h2>
      <div className="form-grid">
        <label className="field grow">
          <span>Монета</span>
          <select
            id="portfolio-coin"
            value={coinId}
            onChange={(event) => {
              setCoinId(event.target.value);
              setFormError('');
            }}
            disabled={coins.length === 0}
          >
            <option value="">Выберите монету</option>
            {coins.map((coin) => (
              <CoinOption key={coin.id} coin={coin} />
            ))}
          </select>
        </label>

        <label className="field">
          <span>Количество</span>
          <input
            id="portfolio-amount"
            type="text"
            inputMode="decimal"
            value={amount}
            autoComplete="off"
            placeholder="0,5"
            onChange={(event) => {
              setAmount(event.target.value);
              setFormError('');
            }}
          />
        </label>

        <label className="field">
          <span>Цена покупки, USD</span>
          <input
            id="portfolio-price"
            type="text"
            inputMode="decimal"
            value={buyPrice}
            autoComplete="off"
            placeholder="100"
            onChange={(event) => {
              setBuyPrice(event.target.value);
              setFormError('');
            }}
          />
        </label>

        <button type="submit" className="button" disabled={coins.length === 0}>
          Добавить
        </button>
      </div>
      {coins.length === 0 ? <p className="hint">Список монет ещё не загружен.</p> : null}
      {formError ? <p className="form-error" role="alert">{formError}</p> : null}
    </form>
  );
}
