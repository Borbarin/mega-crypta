import { useLayoutEffect, useRef } from 'react';
import { setSafeText } from '../lib/domText';

export function SafeText({ value, className }) {
  const ref = useRef(null);
  const text = value == null ? '' : String(value);

  useLayoutEffect(() => {
    setSafeText(ref.current, text);
  });

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
