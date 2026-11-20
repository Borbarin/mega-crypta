import { useCoinStore } from '../store/useCoinStore';
import { useMarketStore } from '../store/useMarketStore';

export function useRetryLoad() {
  const loadMarket = useMarketStore((state) => state.loadMarket);
  const coinCount = useMarketStore((state) => state.coins.length);
  const openCoin = useCoinStore((state) => state.openCoin);
  const coinId = useCoinStore((state) => state.coinId);

  return () => {
    const tasks = [loadMarket({ initial: coinCount === 0 })];
    if (coinId) tasks.push(openCoin(coinId));
    return Promise.all(tasks);
  };
}
