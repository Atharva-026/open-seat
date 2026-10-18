import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBoard } from '../hooks/useBoard.js';
import SeatItem from '../features/community/SeatItem.jsx';
import MyRequests from '../features/community/MyRequests.jsx';

const SORTS = [
  ['fit', 'Best fit', (a, b) => b.score - a.score],
  ['new', 'Newest', (a, b) => b.postedAt - a.postedAt],
];

export default function CommunityPage() {
  const { seats, requests, loaded, ask } = useBoard();
  const [sortKey, setSortKey] = useState('fit');

  const sorted = useMemo(() => {
    const compare = SORTS.find(([key]) => key === sortKey)[2];
    return [...seats].sort(compare);
  }, [seats, sortKey]);
  const fillable = seats.filter((seat) => seat.canFill).length;

  return (
    <div className="page">
      <header className="page-head"><h1>Open seats</h1></header>
      <p className="muted lede">
        Teams post the seats they still need. Your fit score comes from the same graph the agent
        searches: your skills against what the seat needs, plus any path through people you have
        worked with. A solid amber seat means you already cover everything it asks for.
      </p>

      <MyRequests requests={requests} />

      {!loaded && <p className="muted">Loading the board…</p>}
      {loaded && (
        <>
          <div className="board-bar">
            <p>{seats.length} open seats · {fillable} you can fill now</p>
            <div className="chips">
              {SORTS.map(([key, label]) => (
                <button key={key} type="button" aria-pressed={sortKey === key}
                        className={`chip ${sortKey === key ? 'chip-on' : ''}`}
                        onClick={() => setSortKey(key)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {sorted.length === 0
            ? <p className="muted">No open seats right now. A team you lead can post one from <Link to="/app/teams">Teams</Link>.</p>
            : <ul className="board">{sorted.map((seat) => <SeatItem key={seat.id} seat={seat} onRequest={ask} />)}</ul>}
        </>
      )}
    </div>
  );
}