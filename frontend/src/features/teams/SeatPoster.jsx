import { useState } from 'react';
import { postSeat } from '../../api/board.api.js';

const MAX_SKILLS = 5;

export default function SeatPoster({ team, skills, onPosted }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [pitch, setPitch] = useState('');
  const [picked, setPicked] = useState([]);
  const [choice, setChoice] = useState('');
  const [status, setStatus] = useState('idle');

  const byCategory = skills.reduce((groups, skill) => {
    (groups[skill.category] ??= []).push(skill.name);
    return groups;
  }, {});

  const add = () => {
    if (choice && !picked.includes(choice) && picked.length < MAX_SKILLS) setPicked([...picked, choice]);
    setChoice('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    try {
      await postSeat(team.id, { title: title.trim(), pitch: pitch.trim(), skills: picked });
      setOpen(false);
      setTitle('');
      setPitch('');
      setPicked([]);
      setStatus('idle');
      onPosted();
    } catch {
      setStatus('error');
    }
  };

  if (!open) {
    return <button type="button" className="chip" onClick={() => setOpen(true)}>Post a seat to the board</button>;
  }

  return (
    <form className="seat-poster" onSubmit={submit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60}
             placeholder="Seat title, for example Frontend with taste" aria-label="Seat title" />
      <div className="mate-controls">
        <select value={choice} onChange={(e) => setChoice(e.target.value)} aria-label="Needed skill">
          <option value="">Add a needed skill</option>
          {Object.entries(byCategory).map(([category, names]) => (
            <optgroup key={category} label={category}>
              {names.map((name) => <option key={name} value={name}>{name}</option>)}
            </optgroup>
          ))}
        </select>
        <button type="button" className="chip" onClick={add} disabled={!choice}>Add</button>
      </div>
      <div className="chips">
        {picked.map((name) => (
          <button key={name} type="button" className="chip chip-on"
                  onClick={() => setPicked(picked.filter((p) => p !== name))}>
            {name} ✕
          </button>
        ))}
      </div>
      <input value={pitch} onChange={(e) => setPitch(e.target.value)} maxLength={200}
             placeholder="One or two lines on what you are building (optional)" aria-label="Pitch" />
      <div className="chips">
        <button type="submit" className="button" disabled={title.trim().length < 3 || !picked.length || status === 'sending'}>
          {status === 'sending' ? 'Posting…' : 'Post seat'}
        </button>
        <button type="button" className="link-btn" onClick={() => setOpen(false)}>Cancel</button>
      </div>
      {status === 'error' && <p className="muted">Could not post the seat. Please try again.</p>}
    </form>
  );
}