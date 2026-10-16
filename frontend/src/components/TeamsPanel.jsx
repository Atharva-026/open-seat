import { useState } from 'react';
import FeedbackForm from './FeedbackForm.jsx';
import ActivityLog from './ActivityLog.jsx';

export default function TeamsPanel({ teams, me, onUseTeam }) {
  const [openId, setOpenId] = useState(null);
  if (!teams.length) return null;

  return (
    <section className="card match">
      <h2>Your teams</h2>
      {teams.map((team) => {
        const mates = team.members.filter((m) => m.githubLogin !== me);
        const confirmed = team.status === 'confirmed';
        return (
          <article key={team.id} className="candidate">
            <h3>{team.name}</h3>
            <span className={`status status-${team.status}`}>{team.status}</span>
            <span className="muted"> {team.hackathon}</span>

            {team.invites.length > 0 && (
              <ul className="invites">
                {team.invites.map((invite) => (
                  <li key={invite.id}>
                    <span>
                      {invite.name}
                      {invite.isDemo && <span className="badge">demo persona</span>}
                    </span>
                    <span className={`status status-${invite.status}`}>
                      {invite.status}{invite.simulated ? ' (simulated)' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <p className="muted">
              {mates.length ? `With ${mates.map((m) => m.name).join(', ')}` : 'No teammates yet'}
            </p>
            <div className="chips">
              {mates.length > 0 && (
                <button type="button" className="chip"
                        onClick={() => onUseTeam(mates.map((m) => m.githubLogin))}>
                  Use as my team in search
                </button>
              )}
              {confirmed && mates.length > 0 && (
                <button type="button" className="chip"
                        onClick={() => setOpenId(openId === team.id ? null : team.id)}>
                  {openId === team.id ? 'Close' : 'Rate teammates'}
                </button>
              )}
            </div>
            {openId === team.id && <FeedbackForm team={team} me={me} />}
            <ActivityLog events={team.events} />
          </article>
        );
      })}
    </section>
  );
}