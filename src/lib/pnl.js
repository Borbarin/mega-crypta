export function buildPriceMap(coins, extraPrices) {
  const prices = new Map();

  for (const coin of coins) {
    if (typeof coin.currentPrice === 'number') {
      prices.set(coin.id, coin.currentPrice);
    }
  }

  if (extraPrices) {
    for (const [id, price] of Object.entries(extraPrices)) {
      if (!prices.has(id) && typeof price === 'number') {
        prices.set(id, price);
      }
    }
  }

  return prices;
}

export function buildPortfolioView(transactions, priceById) {
  const groups = new Map();
  let invested = 0;
  let currentValue = 0;
  let investedKnown = 0;
  let missingPrices = 0;

  const rows = transactions.map((tx) => {
    const price = priceById.get(tx.coinId);
    const hasPrice = typeof price === 'number';
    const cost = tx.amount * tx.buyPrice;
    const value = hasPrice ? tx.amount * price : null;
    const pnl = hasPrice ? value - cost : null;
    const pnlPercent = hasPrice && cost > 0 ? (pnl / cost) * 100 : null;

    invested += cost;

    if (hasPrice) {
      currentValue += value;
      investedKnown += cost;
      const group = groups.get(tx.coinId) ?? {
        coinId: tx.coinId,
        name: tx.name,
        symbol: tx.symbol,
        value: 0,
      };
      group.value += value;
      groups.set(tx.coinId, group);
    } else {
      missingPrices += 1;
    }

    return { ...tx, price: hasPrice ? price : null, cost, value, pnl, pnlPercent };
  });

  rows.sort((left, right) => right.createdAt - left.createdAt);

  const slices = [...groups.values()]
    .filter((group) => group.value > 0)
    .sort((left, right) => right.value - left.value)
    .map((group) => ({
      ...group,
      share: currentValue > 0 ? (group.value / currentValue) * 100 : 0,
    }));

  const hasRows = transactions.length > 0;
  const hasPriced = missingPrices < transactions.length;

  return {
    rows,
    slices,
    invested: hasRows ? invested : null,
    currentValue: hasRows && hasPriced ? currentValue : null,
    pnl: hasRows && hasPriced ? currentValue - investedKnown : null,
    pnlPercent: hasRows && investedKnown > 0 ? ((currentValue - investedKnown) / investedKnown) * 100 : null,
    missingPrices,
  };
}
