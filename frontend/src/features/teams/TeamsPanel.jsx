import { useState } from 'react';
import FeedbackForm from './FeedbackForm.jsx';
import ActivityLog from './ActivityLog.jsx';
import SeatPoster from './SeatPoster.jsx';
import SeatRow from '../../components/SeatRow.jsx';
import { closeSeat } from '../../api/board.api.js';

function summarize(team, me) {
  const waiting = team.invites.filter((i) => i.status === 'pending');
  const declined = team.invites.filter((i) => i.status === 'declined').length;
  const filled = team.members.map((m) => ({ label: m.name, you: m.githubLogin === me, state: 'filled' }));
  const open = Math.max(team.size - filled.length - waiting.length, 0);
  const posted = team.seats.filter((s) => s.status === 'open');

  return {
    seats: [
      ...filled,
      ...waiting.map((i) => ({ label: i.name, state: 'pending' })),
      ...Array.from({ length: open }, () => ({ label: 'Open', state: 'open' })),
    ],
    open,
    waiting: waiting.length,
    declined,
    posted,
    unposted: Math.max(open - posted.length, 0),
  };
}

export default function TeamsPanel({ teams, me, skills, onFill, onSeatsChanged }) {
  const [openId, setOpenId] = useState(null);
  if (!teams.length) return null;

  const takeDown = async (seatId) => {
    await closeSeat(seatId);
    onSeatsChanged();
  };

  return (
    <section className="card match">
      <h2>Your teams</h2>
      {teams.map((team) => {
        const { seats, open, waiting, declined, posted, unposted } = summarize(team, me);
        const mates = team.members.filter((m) => m.githubLogin !== me);
        const isOwner = !team.createdBy || team.createdBy === me;

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

            {posted.map((seat) => (
              <div key={seat.id} className="posted-seat">
                <span>
                  On the board: <strong>{seat.title}</strong>{' '}
                  <span className="muted">needs {seat.needs.join(', ')}</span>
                </span>
                {isOwner && <button type="button" className="link-btn" onClick={() => takeDown(seat.id)}>Take down</button>}
              </div>
            ))}

            <div className="chips">
              {isOwner && open > 0 && (
                <button type="button" className="chip chip-on" onClick={() => onFill(team)}>
                  Fill {open} open seat{open > 1 ? 's' : ''} with the agent
                </button>
              )}
              {isOwner && unposted > 0 && <SeatPoster team={team} skills={skills} onPosted={onSeatsChanged} />}
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