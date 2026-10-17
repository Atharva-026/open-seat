import { Link } from 'react-router-dom';

const SLOTS = 4;

export default function PartyBar({ proposal, myName }) {
  const { people, teamName, setTeamName, status, send, toggle, dismiss } = proposal;
  const slots = [{ name: myName, you: true }, ...people, ...Array(SLOTS - 1 - people.length).fill(null)];

  return (
    <aside className="party-bar" aria-label="Your team">
      <ol className="slots">
        {slots.map((slot, i) => (
          <li key={slot?.you ? 'you' : slot?.githubLogin ?? `open-${i}`}
              className={`slot ${slot ? 'slot-filled' : ''}`}>
            <span className="slot-seat">{slot ? slot.name.slice(0, 1) : ''}</span>
            <span className="slot-name">{slot ? (slot.you ? 'You' : slot.name) : 'Open'}</span>
            {slot && !slot.you && (
              <button type="button" className="slot-x" aria-label={`Remove ${slot.name}`}
                      onClick={() => toggle(slot)}>×</button>
            )}
          </li>
        ))}
      </ol>

      {people.length > 0 && (
        <div className="party-send">
          <input value={teamName} onChange={(e) => setTeamName(e.target.value)} maxLength={40}
                 placeholder="Team name" aria-label="Team name" />
          <button type="button" className="button" onClick={send} disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send invitations'}
          </button>
        </div>
      )}
      {people.length === 0 && status === 'idle' && (
        <p className="party-note">Add people from the results to fill the seats.</p>
      )}
      {people.length === 0 && status === 'sent' && (
        <p className="party-note">
          Invitations sent. See the replies under <Link to="/app/teams">Teams</Link>.{' '}
          <button type="button" className="link-btn" onClick={dismiss}>Dismiss</button>
        </p>
      )}
      {status === 'error' && <p className="party-note">Could not send the invitations. Please try again.</p>}
    </aside>
  );
}