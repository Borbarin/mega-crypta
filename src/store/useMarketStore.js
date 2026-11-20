import { create } from 'zustand';
import {
  ApiError,
  describeError,
  fetchGlobal,
  fetchMarkets,
  fetchSimpleUsd,
} from '../api/coingecko.js';
import { RATE_LIMIT_COOLDOWN_MS } from '../config.js';
import { usePortfolioStore } from './usePortfolioStore.js';

const SORT_KEYS = new Set(['rank', 'name', 'currentPrice', 'change24h', 'marketCap']);

let marketInflight = null;
let extraInflight = null;

export const useMarketStore = create((set, get) => ({
  coins: [],
  global: null,
  extraPrices: {},
  status: 'loading',
  refreshing: false,
  error: null,
  errorVisible: false,
  rateLimited: false,
  cooldownUntil: 0,
  updatedAt: null,
  filters: {
    query: '',
    minPrice: '',
    maxPrice: '',
    sortKey: 'rank',
    sortDir: 'asc',
  },

  setQuery: (query) => {
    set((state) => ({
      filters: { ...state.filters, query: String(query ?? '') },
    }));
  },

  setPriceRange: (minPrice, maxPrice) => {
    set((state) => ({
      filters: {
        ...state.filters,
        minPrice: String(minPrice ?? ''),
        maxPrice: String(maxPrice ?? ''),
      },
    }));
  },

  toggleSort: (sortKey) => {
    if (!SORT_KEYS.has(sortKey)) return;

    set((state) => {
      if (state.filters.sortKey === sortKey) {
        return {
          filters: {
            ...state.filters,
            sortDir: state.filters.sortDir === 'asc' ? 'desc' : 'asc',
          },
        };
      }

      const sortDir = sortKey === 'name' || sortKey === 'rank' ? 'asc' : 'desc';
      return { filters: { ...state.filters, sortKey, sortDir } };
    });
  },

  resetFilters: () => {
    set((state) => ({
      filters: {
        ...state.filters,
        query: '',
        minPrice: '',
        maxPrice: '',
      },
    }));
  },

  dismissError: () => set({ errorVisible: false }),

  revealError: () => {
    if (get().error) set({ errorVisible: true });
  },

  reportError: (error, { force = false } = {}) => {
    const described = describeError(error);
    const rateLimited = described.status === 429;

    set((state) => ({
      error: described,
      errorVisible: force || !state.error ? true : state.errorVisible,
      rateLimited: rateLimited || state.rateLimited,
      cooldownUntil: rateLimited ? Date.now() + RATE_LIMIT_COOLDOWN_MS : state.cooldownUntil,
      refreshing: false,
    }));
  },

  loadMarket: ({ initial = false } = {}) => {
    if (Date.now() < get().cooldownUntil) return Promise.resolve();
    if (marketInflight) return marketInflight;

    const hasCoins = get().coins.length > 0;
    set({
      refreshing: !initial && hasCoins,
      status: hasCoins ? get().status : 'loading',
    });

    marketInflight = pullMarket(get, set).finally(() => {
      marketInflight = null;
    });

    return marketInflight;
  },

  ensurePrices: (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return Promise.resolve();
    if (Date.now() < get().cooldownUntil) return Promise.resolve();

    const state = get();
    const listed = new Set(state.coins.map((coin) => coin.id));
    const missing = [...new Set(ids.filter((id) => {
      return id && !listed.has(id) && !Object.hasOwn(state.extraPrices, id);
    }))];

    if (!missing.length) return Promise.resolve();
    if (extraInflight) return extraInflight;

    extraInflight = fetchSimpleUsd(missing)
      .then((prices) => {
        const next = { ...get().extraPrices };
        for (const id of missing) {
          next[id] = typeof prices[id] === 'number' ? prices[id] : null;
        }
        set({ extraPrices: next });
      })
      .catch((error) => {
        get().reportError(error);
      })
      .finally(() => {
        extraInflight = null;
      });

    return extraInflight;
  },
}));

async function pullMarket(get, set) {
  const [marketsResult, globalResult] = await Promise.allSettled([
    fetchMarkets(),
    fetchGlobal(),
  ]);

  const failures = [];
  const patch = { refreshing: false };

  if (marketsResult.status === 'fulfilled') {
    patch.coins = marketsResult.value;
    patch.status = 'ready';
    patch.updatedAt = Date.now();
  } else {
    failures.push(marketsResult.reason);
    patch.status = get().coins.length > 0 ? 'ready' : 'error';
  }

  if (globalResult.status === 'fulfilled') {
    patch.global = globalResult.value;
  } else {
    failures.push(globalResult.reason);
  }

  if (patch.coins) {
    const heldIds = usePortfolioStore.getState().transactions.map((tx) => tx.coinId);
    const listed = new Set(patch.coins.map((coin) => coin.id));
    const outside = [...new Set(heldIds.filter((id) => id && !listed.has(id)))];

    if (outside.length) {
      try {
        const prices = await fetchSimpleUsd(outside);
        const extraPrices = { ...get().extraPrices };
        for (const id of outside) {
          extraPrices[id] = typeof prices[id] === 'number' ? prices[id] : null;
        }
        patch.extraPrices = extraPrices;
      } catch (error) {
        failures.push(error);
      }
    }
  }

  if (failures.length === 0) {
    set({
      ...patch,
      error: null,
      errorVisible: false,
      rateLimited: false,
      cooldownUntil: 0,
    });
    return;
  }

  const primary = failures.find((error) => error instanceof ApiError && error.status === 429)
    ?? failures[0];
  const described = describeError(primary);
  const rateLimited = described.status === 429;
  const previous = get();

  set({
    ...patch,
    error: described,
    errorVisible: previous.error ? previous.errorVisible : true,
    rateLimited: rateLimited || previous.rateLimited,
    cooldownUntil: rateLimited ? Date.now() + RATE_LIMIT_COOLDOWN_MS : previous.cooldownUntil,
  });
}
