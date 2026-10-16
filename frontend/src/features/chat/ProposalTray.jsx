import { Link } from 'react-router-dom';

export default function ProposalTray({ proposal }) {
  const { people, teamName, setTeamName, status, send, dismiss } = proposal;

  if (!people.length && status !== 'sent') return null;

  if (!people.length) {
    return (
      <aside className="tray">
        <p>Invitations sent. See the replies under <Link to="/app/teams">Teams</Link>.</p>
        <button type="button" className="link-btn" onClick={dismiss}>Dismiss</button>
      </aside>
    );
  }

  return (
    <aside className="tray" aria-label="Proposed team">
      <p><strong>Proposed team:</strong> you and {people.map((p) => p.name).join(', ')}</p>
      <div className="tray-row">
        <input value={teamName} onChange={(e) => setTeamName(e.target.value)} maxLength={40}
               placeholder="Team name" aria-label="Team name" />
        <button type="button" className="button" onClick={send} disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send invitations'}
        </button>
      </div>
      {status === 'error' && <p className="muted">Could not send the invitations. Please try again.</p>}
    </aside>
  );
}