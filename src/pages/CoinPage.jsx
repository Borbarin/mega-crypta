import { Link, useParams } from 'react-router-dom';
import { Converter } from '../components/Converter';
import { EmptyState } from '../components/EmptyState';
import { PriceChart } from '../components/PriceChart';
import { SafeText } from '../components/SafeText';
import { Skeleton } from '../components/Skeleton';
import { TIMEFRAMES } from '../config';
import { useCoinDetails } from '../hooks/useCoinDetails';
import { formatCompactUsd, formatPercent, formatUsd } from '../lib/format';
import { useCoinStore } from '../store/useCoinStore';

function readCoinId(raw) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function CoinHeader({ coin }) {
  const price = formatUsd(coin.currentPrice);
  const change = formatPercent(coin.change24h);
  const cap = formatCompactUsd(coin.marketCap);
  const changeClass = coin.change24h > 0 ? 'up' : coin.change24h < 0 ? 'down' : '';

  return (
    <header className="coin-header card">
      <div className="coin-title">
        {coin.image ? <img src={coin.image} alt="" width="48" height="48" /> : null}
        <div>
          <h1>
            <SafeText value={coin.name || coin.id} />
          </h1>
          {coin.symbol ? <SafeText value={coin.symbol.toUpperCase()} className="coin-symbol" /> : null}
        </div>
      </div>
      <div className="coin-price">
        {price ? <p className="metric-value num"><SafeText value={price} /></p> : null}
        {change ? <p className={`num ${changeClass}`.trim()}><SafeText value={change} /></p> : null}
        {coin.rank != null ? <p className="hint">Ранг {coin.rank}</p> : null}
        {cap ? <p className="hint">Капитализация {cap}</p> : null}
      </div>
    </header>
  );
}

export function CoinPage() {
  const { id = '' } = useParams();
  const coinId = readCoinId(id);
  useCoinDetails(coinId);

  const coin = useCoinStore((state) => state.coin);
  const notFound = useCoinStore((state) => state.notFound);
  const points = useCoinStore((state) => state.points);
  const timeframe = useCoinStore((state) => state.timeframe);
  const chartLoading = useCoinStore((state) => state.chartLoading);
  const setTimeframe = useCoinStore((state) => state.setTimeframe);

  return (
    <>
      <Link className="back-link" to="/">
        ← К рынку
      </Link>

      {!coin && chartLoading ? (
        <div className="card coin-header" aria-hidden="true">
          <Skeleton className="skeleton-line short" />
          <Skeleton className="skeleton-line tall" />
        </div>
      ) : null}

      {coin ? <CoinHeader coin={coin} /> : null}

      {notFound && !coin ? (
        <EmptyState
          title="Монета не найдена"
          text="Проверьте адрес или вернитесь к списку рынка."
        />
      ) : (
        <>
          <div className="timeframes" role="group" aria-label="Таймфрейм">
            {TIMEFRAMES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={timeframe === item.id ? 'chip active' : 'chip'}
                aria-pressed={timeframe === item.id}
                onClick={() => setTimeframe(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <PriceChart points={points} timeframe={timeframe} loading={chartLoading} />
          <Converter />
        </>
      )}
    </>
  );
}
