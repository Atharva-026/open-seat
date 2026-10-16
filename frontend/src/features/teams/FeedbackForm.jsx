import { useState } from 'react';
import { submitFeedback } from '../../api/teams.api.js';

export default function FeedbackForm({ team, me }) {
  const mates = team.members.filter((m) => m.githubLogin !== me);
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(mates.map((m) => [m.githubLogin, { rating: 4, note: '' }]))
  );
  const [status, setStatus] = useState('idle');

  const update = (login, patch) =>
    setAnswers((cur) => ({ ...cur, [login]: { ...cur[login], ...patch } }));

  const submit = async (event) => {
    event.preventDefault();
    setStatus('saving');
    try {
      const entries = Object.entries(answers).map(([to, v]) => ({
        to, rating: Number(v.rating), note: v.note,
      }));
      await submitFeedback(team.id, entries);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={submit} className="feedback">
      {mates.map((m) => (
        <div key={m.githubLogin} className="feedback-row">
          <span>{m.name}</span>
          <select value={answers[m.githubLogin].rating}
                  onChange={(e) => update(m.githubLogin, { rating: e.target.value })}
                  aria-label={`Rating for ${m.name}`}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} / 5</option>)}
          </select>
          <input value={answers[m.githubLogin].note} maxLength={140} placeholder="One line on how it went"
                 onChange={(e) => update(m.githubLogin, { note: e.target.value })}
                 aria-label={`Note for ${m.name}`} />
        </div>
      ))}
      <button className="button" type="submit" disabled={status === 'saving'}>Save ratings</button>
      {status === 'saved' && <p className="muted">Saved. These ratings now shape your future suggestions.</p>}
      {status === 'error' && <p className="muted">Could not save the ratings. Please try again.</p>}
    </form>
  );
}
