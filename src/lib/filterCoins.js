import { parseLooseNumber } from './format.js';

export function filterAndSortCoins(coins, filters) {
  const query = String(filters.query ?? '').trim().toLowerCase();
  const minPrice = parseLooseNumber(filters.minPrice);
  const maxPrice = parseLooseNumber(filters.maxPrice);

  const filtered = coins.filter((coin) => {
    if (query) {
      const name = coin.name.toLowerCase();
      const symbol = coin.symbol.toLowerCase();
      if (!name.includes(query) && !symbol.includes(query)) return false;
    }

    if (minPrice != null && (coin.currentPrice == null || coin.currentPrice < minPrice)) {
      return false;
    }

    if (maxPrice != null && (coin.currentPrice == null || coin.currentPrice > maxPrice)) {
      return false;
    }

    return true;
  });

  const direction = filters.sortDir === 'desc' ? -1 : 1;
  const sortKey = filters.sortKey;

  return filtered.slice().sort((left, right) => {
    const leftValue = left[sortKey];
    const rightValue = right[sortKey];

    if (leftValue == null && rightValue == null) return 0;
    if (leftValue == null) return 1;
    if (rightValue == null) return -1;

    if (typeof leftValue === 'string' || typeof rightValue === 'string') {
      return String(leftValue).localeCompare(String(rightValue), 'ru') * direction;
    }

    return (leftValue - rightValue) * direction;
  });
}
