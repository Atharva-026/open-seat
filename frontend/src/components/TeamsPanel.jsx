import { useState } from 'react';
import FeedbackForm from './FeedbackForm.jsx';

export default function TeamsPanel({ teams, me, onUseTeam }) {
  const [openId, setOpenId] = useState(null);
  if (!teams.length) return null;

  return (
    <section className="card match">
      <h2>Your teams</h2>
      {teams.map((team) => {
        const mates = team.members.filter((m) => m.githubLogin !== me);
        return (
          <article key={team.id} className="candidate">
            <h3>{team.name}</h3>
            <span className="muted">{team.hackathon}</span>
            <p className="muted">
              With {mates.map((m) => m.name).join(', ')}
              {mates.some((m) => m.isDemo) && <span className="badge">includes demo personas</span>}
            </p>
            <div className="chips">
              <button type="button" className="chip"
                      onClick={() => onUseTeam(mates.map((m) => m.githubLogin))}>
                Use as my team in search
              </button>
              <button type="button" className="chip"
                      onClick={() => setOpenId(openId === team.id ? null : team.id)}>
                {openId === team.id ? 'Close' : 'Rate teammates'}
              </button>
            </div>
            {openId === team.id && <FeedbackForm team={team} me={me} />}
          </article>
        );
      })}
    </section>
  );
}