import { useEffect, useMemo } from 'react';
import { buildPortfolioView, buildPriceMap } from '../lib/pnl';
import { useMarketStore } from '../store/useMarketStore';
import { usePortfolioStore } from '../store/usePortfolioStore';

export function usePortfolioView() {
  const transactions = usePortfolioStore((state) => state.transactions);
  const coins = useMarketStore((state) => state.coins);
  const extraPrices = useMarketStore((state) => state.extraPrices);
  const ensurePrices = useMarketStore((state) => state.ensurePrices);

  const ids = useMemo(
    () => [...new Set(transactions.map((tx) => tx.coinId))],
    [transactions],
  );

  useEffect(() => {
    ensurePrices(ids);
  }, [ids, coins, ensurePrices]);

  return useMemo(
    () => buildPortfolioView(transactions, buildPriceMap(coins, extraPrices)),
    [transactions, coins, extraPrices],
  );
}
