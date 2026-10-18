import { Link } from 'react-router-dom';

export default function MyRequests({ requests }) {
  if (!requests.length) return null;

  return (
    <section className="card match">
      <h2>Your requests</h2>
      <ul className="invites">
        {requests.map((request) => (
          <li key={request.id}>
            <span>{request.seatTitle} <span className="muted">on {request.teamName}</span></span>
            <span className={`status status-${request.status}`}>
              {request.status}{request.simulated ? ' (simulated)' : ''}
            </span>
          </li>
        ))}
      </ul>
      {requests.some((r) => r.status === 'accepted') && (
        <p className="muted">Accepted requests put you on the team. See <Link to="/app/teams">Teams</Link>.</p>
      )}
    </section>
  );
}