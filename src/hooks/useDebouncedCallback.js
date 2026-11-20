import { useEffect, useRef } from 'react';
import { debounce } from '../lib/debounce';

export function useDebouncedCallback(callback, delay) {
  const callbackRef = useRef(callback);
  const debouncedRef = useRef(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const debounced = debounce((...args) => {
      callbackRef.current(...args);
    }, delay);
    debouncedRef.current = debounced;

    return () => {
      debounced.cancel();
      debouncedRef.current = null;
    };
  }, [delay]);

  function call(...args) {
    debouncedRef.current?.(...args);
  }

  call.cancel = () => {
    debouncedRef.current?.cancel();
  };

  return call;
}
