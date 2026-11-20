import { useMemo } from 'react';
import { convertAmount, mergeQuote } from '../lib/convert';
import { useCoinStore } from '../store/useCoinStore';

export function useConversion(amount) {
  const quote = useCoinStore((state) => state.quote);
  const currentPrice = useCoinStore((state) => state.coin?.currentPrice ?? null);

  return useMemo(
    () => convertAmount(amount, mergeQuote(quote, currentPrice)),
    [amount, quote, currentPrice],
  );
}
