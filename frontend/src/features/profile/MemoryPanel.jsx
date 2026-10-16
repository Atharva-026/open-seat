import { useState } from 'react';

const AVAILABILITY = ['full-time', 'evenings', 'weekends'];

export default function MemoryPanel({ memory, onSave, onForget, onForgetAll }) {
  const [timezone, setTimezone] = useState('');
  const [error, setError] = useState('');
  const current = Object.fromEntries(memory.preferences.map((p) => [p.key, p.value]));

  const guarded = async (action) => {
    setError('');
    try { await action(); } catch { setError('That value was not accepted.'); }
  };

  const confirmForgetAll = () => {
    if (window.confirm('Erase everything Open Seat remembers about you?')) guarded(onForgetAll);
  };

  return (
    <section className="card match">
      <h2>What Open Seat remembers about you</h2>
      <p className="muted">
        Kept in your own private graph. It shapes your search rankings, and you can change or erase it any time.
      </p>

      <div className="memory-grid">
        <label className="field">
          Availability
          <select value={current.availability ?? ''}
                  onChange={(e) => (e.target.value ? guarded(() => onSave('availability', e.target.value))
                                                    : guarded(() => onForget('availability')))}>
            <option value="">No preference</option>
            {AVAILABILITY.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>

        <div className="field">
          Timezone {current.timezone && <strong>{current.timezone}</strong>}
          <div className="ask">
            <input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="UTC+5:30"
                   aria-label="Timezone" />
            <button type="button" className="chip" disabled={!timezone.trim()}
                    onClick={() => guarded(async () => { await onSave('timezone', timezone.trim()); setTimezone(''); })}>
              Save
            </button>
            {current.timezone && (
              <button type="button" className="chip" onClick={() => guarded(() => onForget('timezone'))}>Remove</button>
            )}
          </div>
        </div>
      </div>

      {error && <p className="muted">{error}</p>}

      <h3 className="memory-heading">Recent requests</h3>
      {memory.episodes.length === 0
        ? <p className="muted">Nothing yet. Ask the agent for teammates.</p>
        : (
          <ul className="reasons">
            {memory.episodes.map((e) => (
              <li key={e.id}>{e.question}</li>
            ))}
          </ul>
        )}

      <h3 className="memory-heading">What worked for you</h3>
      {memory.patterns?.length > 0
        ? (
          <ul className="reasons">
            {memory.patterns.map((p) => (
              <li key={p.key}>
                Teammates who add {p.categories.join(', ')}: {p.average}/5 over {p.count} rating(s)
              </li>
            ))}
          </ul>
        )
        : <p className="muted">Rate a confirmed team and Open Seat learns which skill mixes work for you.</p>}

      <button type="button" className="chip" onClick={confirmForgetAll}>Forget everything</button>
    </section>
  );
}