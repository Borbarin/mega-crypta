import { useMarketStore } from '../store/useMarketStore';
import { useVisibleCoins } from '../hooks/useVisibleCoins';
import { CoinTable } from '../components/CoinTable';
import { EmptyState } from '../components/EmptyState';
import { MetricCards } from '../components/MetricCards';
import { SearchPanel } from '../components/SearchPanel';
import { TableSkeleton } from '../components/Skeleton';

export function HomePage() {
  const coins = useMarketStore((state) => state.coins);
  const status = useMarketStore((state) => state.status);
  const rows = useVisibleCoins();
  const initialLoading = status === 'loading' && coins.length === 0;

  let content;
  if (initialLoading) {
    content = <TableSkeleton />;
  } else if (coins.length === 0) {
    content = (
      <EmptyState
        title="Нет данных рынка"
        text="Не удалось получить список монет. Повторите запрос, когда связь с API восстановится."
      />
    );
  } else if (rows.length === 0) {
    content = (
      <EmptyState
        title="Ничего не найдено"
        text="Нет монет с таким названием или ценой. Измените условия фильтра."
      />
    );
  } else {
    content = <CoinTable rows={rows} />;
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Рынок</h1>
          <p>Топ-100 криптовалют по капитализации</p>
        </div>
        {!initialLoading && coins.length > 0 ? (
          <p className="count">
            Показано {rows.length} из {coins.length}
          </p>
        ) : null}
      </header>
      <MetricCards />
      <SearchPanel />
      {content}
    </>
  );
}
