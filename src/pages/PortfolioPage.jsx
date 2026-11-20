import { EmptyState } from '../components/EmptyState';
import { PortfolioForm } from '../components/PortfolioForm';
import { PortfolioList } from '../components/PortfolioList';
import { PortfolioPie } from '../components/PortfolioPie';
import { PortfolioSummary } from '../components/PortfolioSummary';
import { usePortfolioView } from '../hooks/usePortfolioView';
import { usePortfolioStore } from '../store/usePortfolioStore';

export function PortfolioPage() {
  const transactions = usePortfolioStore((state) => state.transactions);
  const view = usePortfolioView();

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Портфель</h1>
          <p>Сделки сохраняются в браузере и сразу появляются в других вкладках.</p>
        </div>
      </header>

      <PortfolioForm />

      {transactions.length === 0 ? (
        <EmptyState
          title="Портфель пуст"
          text="Добавьте первую сделку: выберите монету, количество и цену покупки."
        />
      ) : (
        <>
          <PortfolioSummary view={view} />
          <div className="split">
            {view.slices.length ? (
              <PortfolioPie slices={view.slices} />
            ) : (
              <section className="card">
                <h2>Структура портфеля</h2>
                <p className="hint">Диаграмма появится, когда для монет будут известны текущие цены.</p>
              </section>
            )}
            <PortfolioList rows={view.rows} />
          </div>
        </>
      )}
    </>
  );
}
