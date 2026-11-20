import { Link } from 'react-router-dom';
import { formatCompactUsd, formatPercent, formatUsd } from '../lib/format';
import { useMarketStore } from '../store/useMarketStore';
import { SafeText } from './SafeText';

const COLUMNS = [
  { key: 'rank', label: 'Ранг' },
  { key: 'name', label: 'Название' },
  { key: 'currentPrice', label: 'Цена' },
  { key: 'change24h', label: '24 ч' },
  { key: 'marketCap', label: 'Капитализация' },
];

function toneClass(value) {
  if (typeof value !== 'number' || value === 0) return 'num';
  return value > 0 ? 'num up' : 'num down';
}

function OptionalText({ value, className }) {
  if (value == null || value === '') return null;
  return <SafeText value={value} className={className} />;
}

export function CoinTable({ rows }) {
  const sortKey = useMarketStore((state) => state.filters.sortKey);
  const sortDir = useMarketStore((state) => state.filters.sortDir);
  const toggleSort = useMarketStore((state) => state.toggleSort);
  const refreshing = useMarketStore((state) => state.refreshing);

  return (
    <div className="table-wrap" id="market-table" aria-busy={refreshing}>
      <table className="market-table">
        <caption className="visually-hidden">Топ-100 криптовалют</caption>
        <thead>
          <tr>
            {COLUMNS.map((column) => {
              const active = sortKey === column.key;
              const ariaSort = active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none';
              return (
                <th key={column.key} scope="col" aria-sort={ariaSort}>
                  <button type="button" className="sort-button" onClick={() => toggleSort(column.key)}>
                    {column.label}
                    <span aria-hidden="true">{active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
                    <span className="visually-hidden">
                      {active
                        ? (sortDir === 'asc' ? ', по возрастанию' : ', по убыванию')
                        : ', без сортировки'}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((coin) => {
            const price = formatUsd(coin.currentPrice);
            const change = formatPercent(coin.change24h);
            const cap = formatCompactUsd(coin.marketCap);
            const fullCap = formatUsd(coin.marketCap);

            return (
              <tr key={coin.id}>
                <td className="num">{coin.rank == null ? null : coin.rank}</td>
                <td>
                  <Link className="coin-link" to={`/coin/${encodeURIComponent(coin.id)}`}>
                    {coin.image ? (
                      <img
                        src={coin.image}
                        alt=""
                        width="28"
                        height="28"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <span>
                      <OptionalText value={coin.name} className="coin-name" />
                      {coin.symbol ? (
                        <OptionalText value={coin.symbol.toUpperCase()} className="coin-symbol" />
                      ) : null}
                    </span>
                  </Link>
                </td>
                <td className="num">
                  <OptionalText value={price} />
                </td>
                <td className={toneClass(coin.change24h)}>
                  <OptionalText value={change} />
                </td>
                <td className="num" title={fullCap ?? undefined}>
                  <OptionalText value={cap} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
