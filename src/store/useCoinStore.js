import { create } from 'zustand';
import { ApiError, fetchChart, fetchCoinById, fetchQuote } from '../api/coingecko.js';
import { TIMEFRAMES } from '../config.js';
import { useMarketStore } from './useMarketStore.js';

const ALLOWED = new Set(TIMEFRAMES.map((item) => item.id));

let currentLoad = null;
let currentKey = '';
let chartSeq = 0;

function inCooldown() {
  return Date.now() < useMarketStore.getState().cooldownUntil;
}

export const useCoinStore = create((set, get) => ({
  coinId: null,
  coin: null,
  quote: null,
  points: [],
  timeframe: '1',
  chartLoading: false,
  quoteLoading: false,
  notFound: false,

  setTimeframe: (timeframe) => {
    if (!ALLOWED.has(timeframe)) return;

    const coinId = get().coinId;
    if (!coinId || timeframe === get().timeframe) return;

    if (inCooldown()) {
      useMarketStore.getState().revealError();
      return;
    }

    const previous = get().timeframe;
    set({ timeframe });
    get().loadChart(coinId, timeframe, previous);
  },

  openCoin: (coinId) => {
    if (!coinId) return Promise.resolve();
    if (currentLoad && currentKey === coinId) return currentLoad;

    if (inCooldown()) {
      const cached = useMarketStore.getState().coins.find((coin) => coin.id === coinId) ?? null;
      const sameCoin = get().coinId === coinId;
      set({
        coinId,
        coin: cached ?? (sameCoin ? get().coin : null),
        points: sameCoin ? get().points : [],
        quote: sameCoin ? get().quote : null,
        timeframe: sameCoin ? get().timeframe : '1',
        chartLoading: false,
        quoteLoading: false,
        notFound: false,
      });
      useMarketStore.getState().revealError();
      return Promise.resolve();
    }

    currentKey = coinId;
    const cached = useMarketStore.getState().coins.find((coin) => coin.id === coinId) ?? null;
    const sameCoin = get().coinId === coinId;

    set({
      coinId,
      coin: sameCoin && get().coin ? get().coin : cached,
      quote: sameCoin ? get().quote : null,
      points: sameCoin ? get().points : [],
      timeframe: sameCoin ? get().timeframe : '1',
      notFound: false,
      chartLoading: true,
      quoteLoading: !(sameCoin && get().quote),
    });

    const timeframe = get().timeframe;
    currentLoad = Promise.all([
      get().loadCoinMeta(coinId),
      get().loadChart(coinId, timeframe, timeframe),
      get().loadQuote(coinId),
    ]).finally(() => {
      if (currentKey === coinId) currentLoad = null;
    });

    return currentLoad;
  },

  loadCoinMeta: async (coinId) => {
    try {
      const coin = await fetchCoinById(coinId);
      if (get().coinId !== coinId) return;

      if (!coin) {
        set({ notFound: !get().coin });
        return;
      }

      set({ coin, notFound: false });
    } catch (error) {
      if (get().coinId !== coinId || error?.name === 'AbortError') return;

      if (error instanceof ApiError && error.status === 404) {
        set({ notFound: true, coin: null });
        return;
      }

      useMarketStore.getState().reportError(error);
    }
  },

  loadChart: async (coinId, timeframe, rollback = timeframe) => {
    const seq = ++chartSeq;
    set({ chartLoading: true });

    try {
      const points = await fetchChart(coinId, timeframe);
      if (seq !== chartSeq || get().coinId !== coinId) return;
      set({ points, chartLoading: false, timeframe });
    } catch (error) {
      if (seq !== chartSeq || get().coinId !== coinId || error?.name === 'AbortError') return;

      if (error instanceof ApiError && error.status === 404) {
        set({ chartLoading: false, notFound: true, points: [] });
        return;
      }

      set({ chartLoading: false, timeframe: rollback });
      useMarketStore.getState().reportError(error);
    }
  },

  loadQuote: async (coinId) => {
    set({ quoteLoading: true });

    try {
      const quote = await fetchQuote(coinId);
      if (get().coinId !== coinId) return;
      set({ quote, quoteLoading: false });
    } catch (error) {
      if (get().coinId !== coinId || error?.name === 'AbortError') return;
      set({ quoteLoading: false });
      if (error instanceof ApiError && error.status === 404) return;
      useMarketStore.getState().reportError(error);
    }
  },
}));
