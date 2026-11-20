import { useEffect } from 'react';
import { useCoinStore } from '../store/useCoinStore';
import { useMarketStore } from '../store/useMarketStore';

export function useCoinDetails(coinId) {
  const openCoin = useCoinStore((state) => state.openCoin);
  const coins = useMarketStore((state) => state.coins);

  useEffect(() => {
    if (!coinId) return undefined;
    openCoin(coinId);
    return undefined;
  }, [coinId, openCoin]);

  useEffect(() => {
    if (!coinId) return;
    const fresh = coins.find((coin) => coin.id === coinId);
    if (!fresh) return;

    useCoinStore.setState((state) => {
      if (state.coinId !== coinId) return state;
      return { coin: fresh };
    });
  }, [coins, coinId]);
}
