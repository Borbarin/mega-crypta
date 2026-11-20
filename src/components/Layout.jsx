import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useMarketPolling } from '../hooks/useMarketPolling';
import { usePortfolioSync } from '../hooks/usePortfolioSync';
import { formatClock } from '../lib/format';
import { useMarketStore } from '../store/useMarketStore';
import { ErrorModal } from './ErrorModal';
import { Spinner } from './Skeleton';

export function Layout() {
  useMarketPolling();
  usePortfolioSync();

  const location = useLocation();
  const refreshing = useMarketStore((state) => state.refreshing);
  const updatedAt = useMarketStore((state) => state.updatedAt);
  const rateLimited = useMarketStore((state) => state.rateLimited);
  const loadMarket = useMarketStore((state) => state.loadMarket);
  const clock = formatClock(updatedAt);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app">
      {refreshing ? (
        <div className="progress" role="progressbar" aria-label="Обновление данных">
          <span />
        </div>
      ) : null}

      <header className="site-header">
        <div className="header-inner">
          <NavLink to="/" className="brand" end>
            <span className="brand-mark" aria-hidden="true">М</span>
            Мегакрипта
          </NavLink>

          <nav className="nav" aria-label="Разделы">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Рынок
            </NavLink>
            <NavLink
              to="/portfolio"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Портфель
            </NavLink>
          </nav>

          <div className="header-tools">
            {refreshing ? <Spinner /> : null}
            {clock ? <span className="clock">Обновлено в {clock}</span> : null}
            {rateLimited ? <span className="rate-note">Пауза из-за лимита API</span> : null}
            <button
              type="button"
              className="button ghost"
              onClick={() => loadMarket({ initial: false })}
              disabled={refreshing}
            >
              Обновить
            </button>
          </div>
        </div>
      </header>

      <div className="visually-hidden" aria-live="polite">
        {refreshing ? 'Данные обновляются' : ''}
      </div>

      <main className="page">
        <Outlet />
      </main>

      <ErrorModal />
    </div>
  );
}
