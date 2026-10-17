import { useState } from 'react';
import FeedbackForm from './FeedbackForm.jsx';
import ActivityLog from './ActivityLog.jsx';
import SeatRow from '../../components/SeatRow.jsx';

function summarize(team, me) {
  const waiting = team.invites.filter((i) => i.status === 'pending');
  const declined = team.invites.filter((i) => i.status === 'declined').length;
  const filled = team.members.map((m) => ({ label: m.name, you: m.githubLogin === me, state: 'filled' }));
  const open = Math.max(team.size - filled.length - waiting.length, 0);

  return {
    seats: [
      ...filled,
      ...waiting.map((i) => ({ label: i.name, state: 'pending' })),
      ...Array.from({ length: open }, () => ({ label: 'Open', state: 'open' })),
    ],
    open,
    waiting: waiting.length,
    declined,
  };
}

export default function TeamsPanel({ teams, me, onFill }) {
  const [openId, setOpenId] = useState(null);
  if (!teams.length) return null;

  return (
    <section className="card match">
      <h2>Your teams</h2>
      {teams.map((team) => {
        const { seats, open, waiting, declined } = summarize(team, me);
        const mates = team.members.filter((m) => m.githubLogin !== me);
        const canFill = open > 0 && (!team.createdBy || team.createdBy === me);

        return (
          <article key={team.id} className="candidate">
            <h3>{team.name}</h3>
            <span className={`status status-${team.status}`}>{team.status}</span>
            <p className="muted">
              {team.members.length} of {team.size} seats filled
              {waiting > 0 && ` · ${waiting} waiting for a reply`}
              {declined > 0 && ` · ${declined} declined`}
            </p>
            <SeatRow seats={seats} />
            <div className="chips">
              {canFill && (
                <button type="button" className="chip chip-on" onClick={() => onFill(team)}>
                  Fill {open} open seat{open > 1 ? 's' : ''}
                </button>
              )}
              {team.status === 'confirmed' && mates.length > 0 && (
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