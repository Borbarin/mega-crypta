import { useMemo } from 'react';
import { filterAndSortCoins } from '../lib/filterCoins';
import { useMarketStore } from '../store/useMarketStore';

export function useVisibleCoins() {
  const coins = useMarketStore((state) => state.coins);
  const filters = useMarketStore((state) => state.filters);

  return useMemo(() => filterAndSortCoins(coins, filters), [coins, filters]);
}
