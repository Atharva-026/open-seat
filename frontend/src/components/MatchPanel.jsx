import { useState } from 'react';
import { useSkills } from '../hooks/useSkills.js';
import { useMatch } from '../hooks/useMatch.js';
import { createTeam } from '../api/teams.api.js';
import SkillPicker from './SkillPicker.jsx';
import CandidateCard from './CandidateCard.jsx';

const MAX_ADDED = 3; // you plus three others makes a team of four
const parseLogins = (text) => text.split(',').map((t) => t.trim()).filter(Boolean);

export default function MatchPanel({ teammates, onTeammatesChange, onTeamFormed }) {
  const skills = useSkills();
  const { status, result, run } = useMatch();
  const [selected, setSelected] = useState([]);
  const [proposed, setProposed] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [formState, setFormState] = useState('idle');

  const toggleSkill = (name) =>
    setSelected((cur) => (cur.includes(name) ? cur.filter((s) => s !== name) : [...cur, name]));

  const toggleCandidate = (candidate) =>
    setProposed((cur) =>
      cur.some((p) => p.githubLogin === candidate.githubLogin)
        ? cur.filter((p) => p.githubLogin !== candidate.githubLogin)
        : [...cur, candidate]
    );

  const submit = (event) => {
    event.preventDefault();
    run(selected, parseLogins(teammates));
  };

  const formTeam = async () => {
    setFormState('saving');
    try {
      await createTeam({ name: teamName, members: proposed.map((p) => p.githubLogin) });
      setProposed([]);
      setTeamName('');
      setFormState('done');
      onTeamFormed();
    } catch {
      setFormState('error');
    }
  };

  return (
    <section className="card match">
      <h2>What does your team need?</h2>
      <p className="muted">
        Pick the skills you need. Open Seat subtracts what you and your teammates already
        cover, then ranks people who fill the rest.
      </p>

      <form onSubmit={submit}>
        <SkillPicker skills={skills} selected={selected} onToggle={toggleSkill} />
        <label className="field">
          Teammates you already have (GitHub logins, comma separated)
          <input value={teammates} onChange={(e) => onTeammatesChange(e.target.value)}
                 placeholder="demo-aarav-1" />
        </label>
        <button className="button" type="submit" disabled={!selected.length || status === 'loading'}>
          {status === 'loading' ? 'Searching…' : 'Find teammates'}
        </button>
      </form>

      {status === 'error' && <p className="muted">Something went wrong. Check the skill names and logins.</p>}

      {proposed.length > 0 && (
        <div className="proposal">
          <p><strong>Proposed team:</strong> you + {proposed.map((p) => p.name).join(', ')}</p>
          <input value={teamName} onChange={(e) => setTeamName(e.target.value)}
                 placeholder="Team name" maxLength={40} aria-label="Team name" />
          <button type="button" className="button" onClick={formTeam} disabled={formState === 'saving'}>
            {formState === 'saving' ? 'Forming…' : 'Form team'}
          </button>
        </div>
      )}
      {formState === 'done' && <p className="muted">Team formed. Rate your teammates in "Your teams" below once the event ends.</p>}
      {formState === 'error' && <p className="muted">Could not form the team. Please try again.</p>}

      {status === 'done' && (
        <div className="results">
          <p className="summary">
            Gap: <strong>{result.gap.join(', ') || 'none'}</strong>
            {result.alreadyCovered.length > 0 && <> · Already covered: {result.alreadyCovered.join(', ')}</>}
            {result.unknown.length > 0 && <> · Not recognised: {result.unknown.join(', ')}</>}
          </p>
          {result.candidates.length === 0
            ? <p className="muted">Nobody to suggest. Your team already covers every skill you picked.</p>
            : result.candidates.map((c) => (
              <CandidateCard
                key={c.githubLogin}
                candidate={c}
                added={proposed.some((p) => p.githubLogin === c.githubLogin)}
                canAdd={proposed.length < MAX_ADDED}
                onToggle={toggleCandidate}
              />
            ))}
        </div>
      )}
    </section>
  );
}