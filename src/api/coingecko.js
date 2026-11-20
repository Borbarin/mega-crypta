import { plainText, safeImageUrl } from '../lib/domText.js';

const BASE_URL = 'https://api.coingecko.com/api/v3';
const CHART_DAYS = new Set(['1', '7', '30', '365']);

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function describeError(error) {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return {
        title: 'Слишком много запросов',
        message: error.message,
        status: 429,
      };
    }

    if (error.status === 0) {
      return {
        title: 'Нет соединения',
        message: error.message,
        status: 0,
      };
    }

    return {
      title: 'Ошибка загрузки',
      message: error.message,
      status: error.status,
    };
  }

  return {
    title: 'Ошибка загрузки',
    message: 'Не удалось обновить данные. Уже загруженные цены сохранены.',
    status: 0,
  };
}

function asNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function mapCoin(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const id = plainText(raw.id).slice(0, 120);
  if (!id) return null;

  return {
    id,
    symbol: plainText(raw.symbol).slice(0, 32).toLowerCase(),
    name: plainText(raw.name).slice(0, 120),
    image: safeImageUrl(raw.image),
    currentPrice: asNumber(raw.current_price),
    marketCap: asNumber(raw.market_cap),
    rank: asNumber(raw.market_cap_rank),
    change24h: asNumber(raw.price_change_percentage_24h),
  };
}

export function mapGlobal(payload) {
  const data = payload?.data;
  if (!data || typeof data !== 'object') {
    return {
      totalMarketCap: null,
      totalVolume: null,
      change24h: null,
      btcDominance: null,
    };
  }

  return {
    totalMarketCap: asNumber(data.total_market_cap?.usd),
    totalVolume: asNumber(data.total_volume?.usd),
    change24h: asNumber(data.market_cap_change_percentage_24h_usd),
    btcDominance: asNumber(data.market_cap_percentage?.btc),
  };
}

function downsample(points, maxPoints) {
  if (points.length <= maxPoints) return points;

  const step = Math.ceil(points.length / maxPoints);
  const sampled = [];

  for (let index = 0; index < points.length; index += step) {
    sampled.push(points[index]);
  }

  const last = points[points.length - 1];
  if (sampled[sampled.length - 1] !== last) sampled.push(last);
  return sampled;
}

export function mapChart(payload) {
  const prices = Array.isArray(payload?.prices) ? payload.prices : [];
  const points = [];

  for (const pair of prices) {
    if (!Array.isArray(pair)) continue;
    const timestamp = pair[0];
    const value = pair[1];
    if (typeof timestamp !== 'number' || typeof value !== 'number') continue;
    points.push({ ts: timestamp, value });
  }

  return downsample(points, 100);
}

export function mapQuote(payload, coinId) {
  const row = payload?.[coinId];
  if (!row || typeof row !== 'object') {
    return { usd: null, eur: null, btc: null };
  }

  return {
    usd: asNumber(row.usd),
    eur: asNumber(row.eur),
    btc: asNumber(row.btc),
  };
}

async function fetchJson(path, signal) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      signal,
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError('Нет соединения с сервером. Проверьте сеть и попробуйте снова.', 0);
  }

  if (response.status === 429) {
    throw new ApiError(
      'CoinGecko ограничил частоту запросов (429). Обновление приостановлено на минуту, уже загруженные данные сохранены.',
      429,
    );
  }

  if (!response.ok) {
    throw new ApiError(`Сервис временно недоступен (ошибка ${response.status}).`, response.status);
  }

  try {
    return await response.json();
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError('Сервер вернул некорректный ответ.', 0);
  }
}

export async function fetchMarkets(signal) {
  const data = await fetchJson(
    '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h',
    signal,
  );

  if (!Array.isArray(data)) return [];
  return data.map(mapCoin).filter(Boolean);
}

export async function fetchGlobal(signal) {
  const data = await fetchJson('/global', signal);
  return mapGlobal(data);
}

export async function fetchCoinById(coinId, signal) {
  const data = await fetchJson(
    `/coins/markets?vs_currency=usd&ids=${encodeURIComponent(coinId)}&price_change_percentage=24h`,
    signal,
  );

  if (!Array.isArray(data) || !data[0]) return null;
  return mapCoin(data[0]);
}

export async function fetchChart(coinId, days, signal) {
  if (!CHART_DAYS.has(days)) {
    throw new ApiError('Неизвестный таймфрейм.', 0);
  }

  const data = await fetchJson(
    `/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=usd&days=${days}`,
    signal,
  );

  return mapChart(data);
}

export async function fetchQuote(coinId, signal) {
  const data = await fetchJson(
    `/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd,eur,btc`,
    signal,
  );

  return mapQuote(data, coinId);
}

export async function fetchSimpleUsd(ids, signal) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return {};

  const data = await fetchJson(
    `/simple/price?ids=${unique.map((id) => encodeURIComponent(id)).join(',')}&vs_currencies=usd`,
    signal,
  );

  const prices = {};
  for (const id of unique) {
    const usd = asNumber(data?.[id]?.usd);
    if (usd != null) prices[id] = usd;
  }
  return prices;
}
