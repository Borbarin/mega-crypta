import { parseLooseNumber } from './format.js';

export function mergeQuote(quote, currentPrice) {
  const baseUsd = typeof quote?.usd === 'number' ? quote.usd : null;
  const usd = typeof currentPrice === 'number' ? currentPrice : baseUsd;

  if (baseUsd != null && baseUsd > 0 && usd != null) {
    const ratio = usd / baseUsd;
    return {
      usd,
      eur: typeof quote?.eur === 'number' ? quote.eur * ratio : null,
      btc: typeof quote?.btc === 'number' ? quote.btc * ratio : null,
    };
  }

  return {
    usd,
    eur: typeof quote?.eur === 'number' ? quote.eur : null,
    btc: typeof quote?.btc === 'number' ? quote.btc : null,
  };
}

export function convertAmount(amount, quote) {
  const text = String(amount ?? '').trim();
  if (!text) {
    return { usd: null, eur: null, btc: null, invalid: false, empty: true };
  }

  const quantity = parseLooseNumber(text);
  if (quantity == null || quantity < 0) {
    return { usd: null, eur: null, btc: null, invalid: true, empty: false };
  }

  if (!quote) {
    return { usd: null, eur: null, btc: null, invalid: false, empty: false };
  }

  return {
    usd: typeof quote.usd === 'number' ? quantity * quote.usd : null,
    eur: typeof quote.eur === 'number' ? quantity * quote.eur : null,
    btc: typeof quote.btc === 'number' ? quantity * quote.btc : null,
    invalid: false,
    empty: false,
  };
}
