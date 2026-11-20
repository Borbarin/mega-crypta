const usdStandard = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const usdPrecise = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 8,
});

const usdCompact = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 2,
});

const eurStandard = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

const eurPrecise = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 8,
});

const amountFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 8 });

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function parseLooseNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (value == null) return null;

  const trimmed = String(value).trim().replace(/\s/g, '').replace(',', '.');
  if (!trimmed || trimmed === '.' || trimmed === '-' || trimmed === '-.') return null;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatMoney(value, standard, precise) {
  if (!isNumber(value)) return null;
  const abs = Math.abs(value);
  if (abs !== 0 && abs < 0.01) return precise.format(value);
  return standard.format(value);
}

export function formatUsd(value) {
  return formatMoney(value, usdStandard, usdPrecise);
}

export function formatEur(value) {
  return formatMoney(value, eurStandard, eurPrecise);
}

export function formatBtc(value) {
  if (!isNumber(value)) return null;
  return `${amountFormat.format(value)} BTC`;
}

export function formatCompactUsd(value) {
  if (!isNumber(value)) return null;
  return usdCompact.format(value);
}

export function formatAmount(value) {
  if (!isNumber(value)) return null;
  return amountFormat.format(value);
}

export function formatPercent(value) {
  if (!isNumber(value)) return null;
  const abs = Math.abs(value).toFixed(2);
  if (value > 0) return `+${abs} %`;
  if (value < 0) return `−${abs} %`;
  return `${abs} %`;
}

export function formatPlainPercent(value) {
  if (!isNumber(value)) return null;
  return `${value.toFixed(2)} %`;
}

export function formatClock(timestamp) {
  if (!isNumber(timestamp)) return null;
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(timestamp);
}

export function formatChartLabel(timestamp, timeframe) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';

  if (timeframe === '1') {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  if (timeframe === '365') {
    return new Intl.DateTimeFormat('ru-RU', {
      month: 'short',
      year: '2-digit',
    }).format(date);
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}
