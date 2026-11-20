import { useEffect } from 'react';
import { POLL_INTERVAL_MS } from '../config';
import { useMarketStore } from '../store/useMarketStore';

export function useMarketPolling() {
  const loadMarket = useMarketStore((state) => state.loadMarket);

  useEffect(() => {
    loadMarket({ initial: true });

    const timerId = setInterval(() => {
      loadMarket({ initial: false });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timerId);
  }, [loadMarket]);
}
