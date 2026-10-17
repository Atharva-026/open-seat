import { useState } from 'react';
import { submitFeedback } from '../../api/teams.api.js';

const DELIVERED = [['yes', 'Yes'], ['partly', 'Partly'], ['no', 'No']];

export default function FeedbackForm({ team, me }) {
  const mates = team.members.filter((m) => m.githubLogin !== me);
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(mates.map((m) => [m.githubLogin, { rating: 4, note: '', delivered: '' }]))
  );
  const [status, setStatus] = useState('idle');

  const update = (login, patch) =>
    setAnswers((cur) => ({ ...cur, [login]: { ...cur[login], ...patch } }));

  const submit = async (event) => {
    event.preventDefault();
    setStatus('saving');
    try {
      const entries = Object.entries(answers).map(([to, v]) => ({
        to, rating: Number(v.rating), note: v.note, delivered: v.delivered,
      }));
      await submitFeedback(team.id, entries);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={submit} className="feedback">
      {mates.map((mate) => {
        const chosenFor = team.invites.find((i) => i.login === mate.githubLogin)?.forSkills ?? [];
        const answer = answers[mate.githubLogin];

        return (
          <section key={mate.githubLogin} className="mate" aria-label={mate.name}>
            <div>
              <strong>{mate.name}</strong>
              {mate.isDemo && <span className="badge">demo persona</span>}
            </div>
            {chosenFor.length > 0 && <p className="mate-meta">Chosen for: {chosenFor.join(', ')}</p>}
            {mate.evidence?.length > 0 && (
              <ul className="mate-evidence">
                {mate.evidence.map((skill) => (
                  <li key={skill.name}>
                    {skill.name}, level {skill.level}
                    {skill.repos.length > 0 && `, from ${skill.repos.join(', ')}`}
                  </li>
                ))}
              </ul>
            )}
            {mate.isDemo && <p className="mate-meta">Demo persona: these repositories are synthetic.</p>}

            <div className="mate-controls" role="group" aria-label={`Did ${mate.name} deliver?`}>
              <span className="mate-meta">
                {chosenFor.length ? 'Delivered what you chose them for?' : 'Delivered what the team needed?'}
              </span>
              {DELIVERED.map(([value, label]) => (
                <button key={value} type="button" aria-pressed={answer.delivered === value}
                        className={`chip ${answer.delivered === value ? 'chip-on' : ''}`}
                        onClick={() => update(mate.githubLogin, { delivered: answer.delivered === value ? '' : value })}>
                  {label}
                </button>
              ))}
            </div>

            <div className="mate-controls">
              <select value={answer.rating} aria-label={`Rating for ${mate.name}`}
                      onChange={(e) => update(mate.githubLogin, { rating: e.target.value })}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} / 5</option>)}
              </select>
              <input value={answer.note} maxLength={140} placeholder="One line on how it went"
                     aria-label={`Note for ${mate.name}`}
                     onChange={(e) => update(mate.githubLogin, { note: e.target.value })} />
            </div>
          </section>
        );
      })}
      <button className="button" type="submit" disabled={status === 'saving'}>Save ratings</button>
      {status === 'saved' && <p className="muted">Saved. These ratings now shape your future suggestions.</p>}
      {status === 'error' && <p className="muted">Could not save the ratings. Please try again.</p>}
    </form>
  );
}