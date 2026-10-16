export default function ActivityLog({ events }) {
  if (!events?.length) return null;

  return (
    <details className="steps">
      <summary>Agent activity ({events.length})</summary>
      <ol>
        {events.map((event) => (
          <li key={event.id}>
            <strong>{event.agent}: {event.action}</strong>
            <span className="evidence">{event.detail}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}