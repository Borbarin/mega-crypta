import { useEffect, useRef } from 'react';
import { useRetryLoad } from '../hooks/useRetryLoad';
import { useMarketStore } from '../store/useMarketStore';

export function ErrorModal() {
  const error = useMarketStore((state) => state.error);
  const open = useMarketStore((state) => state.errorVisible);
  const dismiss = useMarketStore((state) => state.dismissError);
  const retry = useRetryLoad();
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const onKey = (event) => {
      if (event.key === 'Escape') dismiss();
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, dismiss]);

  if (!open || !error) return null;

  return (
    <div className="modal-backdrop" onClick={dismiss}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="error-title"
        tabIndex={-1}
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="eyebrow">{error.status === 429 ? '429 Too Many Requests' : 'Сбой API'}</p>
        <h2 id="error-title">{error.title}</h2>
        <p>{error.message}</p>
        <div className="modal-actions">
          <button type="button" className="button ghost" onClick={dismiss}>
            Закрыть
          </button>
          <button type="button" className="button" onClick={() => retry()}>
            Повторить
          </button>
        </div>
      </div>
    </div>
  );
}
