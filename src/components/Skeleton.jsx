export function Spinner({ label = 'Обновление' }) {
  return (
    <span className="spinner-wrap" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function Skeleton({ className = '' }) {
  return <span className={`skeleton ${className}`.trim()} aria-hidden="true" />;
}

export function MetricSkeleton() {
  return (
    <div className="metrics" aria-hidden="true">
      {['a', 'b', 'c', 'd'].map((key) => (
        <div className="card metric" key={key}>
          <Skeleton className="skeleton-line short" />
          <Skeleton className="skeleton-line tall" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="table-wrap" aria-hidden="true">
      {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((key) => (
        <div className="skeleton-row" key={key}>
          <Skeleton className="skeleton-line" />
        </div>
      ))}
    </div>
  );
}
