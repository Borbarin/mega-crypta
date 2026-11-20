import { useEffect } from 'react';
import { subscribePortfolio, usePortfolioStore } from '../store/usePortfolioStore';

export function usePortfolioSync() {
  const hydrate = usePortfolioStore((state) => state.hydrate);

  useEffect(() => subscribePortfolio(hydrate), [hydrate]);
}
