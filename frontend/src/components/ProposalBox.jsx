export default function ProposalBox({ proposal }) {
  const { people, teamName, setTeamName, status, send, toggle, dismiss } = proposal;

  if (!people.length && status !== 'sent') return null;

  if (!people.length) {
    return (
      <aside className="tray card">
        <span>Invitations sent. Replies appear under "Your teams".</span>
        <button type="button" className="chip" onClick={dismiss}>Dismiss</button>
      </aside>
    );
  }

  return (
    <aside className="tray card" aria-label="Proposed team">
      <div>
        <strong>Proposed team:</strong> you + {people.map((p) => p.name).join(', ')}
        <div className="chips">
          {people.map((p) => (
            <button key={p.githubLogin} type="button" className="chip" onClick={() => toggle(p)}
                    aria-label={`Remove ${p.name}`}>
              {p.name} ✕
            </button>
          ))}
        </div>
      </div>
      <input value={teamName} onChange={(e) => setTeamName(e.target.value)} maxLength={40}
             placeholder="Team name" aria-label="Team name" />
      <button type="button" className="button" onClick={send} disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send invitations'}
      </button>
      {status === 'error' && <p className="muted">Could not send the invitations. Please try again.</p>}
    </aside>
  );
}