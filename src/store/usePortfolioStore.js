import { create } from 'zustand';
import { PORTFOLIO_CHANNEL, PORTFOLIO_STORAGE_KEY } from '../config.js';
import { plainText } from '../lib/domText.js';
import { parseLooseNumber } from '../lib/format.js';

let channel = null;
let channelReady = false;

function getChannel() {
  if (channelReady) return channel;
  channelReady = true;

  try {
    channel = new BroadcastChannel(PORTFOLIO_CHANNEL);
  } catch {
    channel = null;
  }

  return channel;
}

function normalizeTransaction(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const amount = Number(raw.amount);
  const buyPrice = Number(raw.buyPrice);
  if (typeof raw.id !== 'string' || !raw.id) return null;
  if (typeof raw.coinId !== 'string' || !raw.coinId) return null;
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (!Number.isFinite(buyPrice) || buyPrice <= 0) return null;

  return {
    id: plainText(raw.id).slice(0, 80),
    coinId: plainText(raw.coinId).slice(0, 120),
    name: plainText(raw.name).slice(0, 120),
    symbol: plainText(raw.symbol).slice(0, 32).toLowerCase(),
    amount,
    buyPrice,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
  };
}

export function parsePortfolio(raw) {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeTransaction).filter(Boolean);
  } catch {
    return [];
  }
}

function readInitialPortfolio() {
  try {
    return parsePortfolio(localStorage.getItem(PORTFOLIO_STORAGE_KEY));
  } catch {
    return [];
  }
}

function persistPortfolio(transactions) {
  try {
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(transactions));
  } catch {
    // The in-memory list still updates this tab if storage is blocked.
  }

  getChannel()?.postMessage({ type: 'portfolio', transactions });
}

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const usePortfolioStore = create((set, get) => ({
  transactions: readInitialPortfolio(),

  hydrate: (transactions) => {
    const next = Array.isArray(transactions)
      ? transactions.map(normalizeTransaction).filter(Boolean)
      : [];
    set({ transactions: next });
  },

  addTransaction: ({ coinId, name, symbol, amount, buyPrice }) => {
    const parsedAmount = parseLooseNumber(amount);
    const parsedPrice = parseLooseNumber(buyPrice);

    if (!coinId) return { ok: false, message: 'Выберите монету' };
    if (parsedAmount == null || parsedAmount <= 0) {
      return { ok: false, message: 'Укажите количество больше нуля' };
    }
    if (parsedPrice == null || parsedPrice <= 0) {
      return { ok: false, message: 'Укажите цену покупки больше нуля' };
    }

    const transaction = {
      id: createId(),
      coinId: plainText(coinId).slice(0, 120),
      name: plainText(name).slice(0, 120),
      symbol: plainText(symbol).slice(0, 32).toLowerCase(),
      amount: parsedAmount,
      buyPrice: parsedPrice,
      createdAt: Date.now(),
    };

    const transactions = [...get().transactions, transaction];
    set({ transactions });
    persistPortfolio(transactions);
    return { ok: true };
  },

  removeTransaction: (id) => {
    const transactions = get().transactions.filter((tx) => tx.id !== id);
    set({ transactions });
    persistPortfolio(transactions);
  },
}));

export function subscribePortfolio(onChange) {
  const onStorage = (event) => {
    if (event.key !== PORTFOLIO_STORAGE_KEY) return;
    onChange(parsePortfolio(event.newValue));
  };

  const onMessage = (event) => {
    const data = event.data;
    if (!data || data.type !== 'portfolio' || !Array.isArray(data.transactions)) return;
    onChange(data.transactions);
  };

  window.addEventListener('storage', onStorage);
  const port = getChannel();
  port?.addEventListener('message', onMessage);

  return () => {
    window.removeEventListener('storage', onStorage);
    port?.removeEventListener('message', onMessage);
  };
}
