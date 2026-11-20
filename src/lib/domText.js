export function plainText(value) {
  const source = String(value ?? '');
  let text = '';

  for (const char of source) {
    const code = char.codePointAt(0);
    if (code <= 31 || code === 127) continue;
    text += char;
  }

  return text;
}

export function safeImageUrl(value) {
  if (typeof value !== 'string' || !value) return '';

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return '';
    return url.href;
  } catch {
    return '';
  }
}

export function setSafeText(element, value) {
  if (!element) return;
  element.textContent = value == null ? '' : String(value);
}
