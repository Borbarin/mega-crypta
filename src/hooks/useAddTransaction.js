import { useMarketStore } from '../store/useMarketStore';
import { usePortfolioStore } from '../store/usePortfolioStore';

export function useAddTransaction() {
  const addTransaction = usePortfolioStore((state) => state.addTransaction);
  const coins = useMarketStore((state) => state.coins);

  return ({ coinId, amount, buyPrice }) => {
    const coin = coins.find((item) => item.id === coinId);
    if (!coin) return { ok: false, message: 'Выберите монету' };

    return addTransaction({
      coinId: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      amount,
      buyPrice,
    });
  };
}
