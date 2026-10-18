export default function SeatRequestsPanel({ requests, onRespond }) {
  if (!requests.length) return null;

  return (
    <section className="card match">
      <h2>People asking to join your teams</h2>
      {requests.map((request) => (
        <article key={request.id} className="candidate">
          <h3>{request.name}</h3>
          {request.isDemo && <span className="badge">demo persona</span>}
          <p className="muted">wants "{request.seatTitle}" on {request.teamName}</p>
          {request.message && <p>{request.message}</p>}
          {request.evidence.length > 0 && (
            <ul className="mate-evidence">
              {request.evidence.map((skill) => (
                <li key={skill.name}>
                  {skill.name}, level {skill.level}
                  {skill.repos.length > 0 && `, from ${skill.repos.join(', ')}`}
                </li>
              ))}
            </ul>
          )}
          <div className="chips">
            <button type="button" className="chip chip-on" onClick={() => onRespond(request.id, true)}>Accept</button>
            <button type="button" className="chip" onClick={() => onRespond(request.id, false)}>Decline</button>
          </div>
        </article>
      ))}
    </section>
  );
}