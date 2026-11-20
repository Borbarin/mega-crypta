import { formatAmount, formatPercent, formatUsd } from '../lib/format';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { SafeText } from './SafeText';

function toneClass(value) {
  if (typeof value !== 'number' || value === 0) return 'num';
  return value > 0 ? 'num up' : 'num down';
}

function Cell({ value, className = 'num' }) {
  if (value == null || value === '') return <td className={className} />;
  return (
    <td className={className}>
      <SafeText value={value} />
    </td>
  );
}

export function PortfolioList({ rows }) {
  const removeTransaction = usePortfolioStore((state) => state.removeTransaction);

  return (
    <section className="card">
      <h2>Сделки</h2>
      <div className="table-wrap">
        <table className="market-table">
          <thead>
            <tr>
              <th scope="col">Монета</th>
              <th scope="col">Количество</th>
              <th scope="col">Покупка</th>
              <th scope="col">Сейчас</th>
              <th scope="col">Стоимость</th>
              <th scope="col">PnL</th>
              <th scope="col">
                <span className="visually-hidden">Действие</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const pnl = formatUsd(row.pnl);
              const pnlPercent = formatPercent(row.pnlPercent);

              return (
                <tr key={row.id}>
                  <td>
                    <SafeText value={row.name} className="coin-name" />
                    {row.symbol ? (
                      <SafeText value={row.symbol.toUpperCase()} className="coin-symbol" />
                    ) : null}
                  </td>
                  <Cell value={formatAmount(row.amount)} />
                  <Cell value={formatUsd(row.buyPrice)} />
                  <Cell value={formatUsd(row.price)} />
                  <Cell value={formatUsd(row.value)} />
                  <td className={toneClass(row.pnl)}>
                    {pnl ? <SafeText value={pnl} /> : null}
                    {pnlPercent ? <SafeText value={pnlPercent} className="coin-symbol" /> : null}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="button danger"
                      onClick={() => removeTransaction(row.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
