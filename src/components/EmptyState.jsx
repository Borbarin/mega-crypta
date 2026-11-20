export function EmptyState({ title, text, action }) {
  return (
    <div className="empty" role="status">
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
      {action ?? null}
    </div>
  );
}
