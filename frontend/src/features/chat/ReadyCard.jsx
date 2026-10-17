import { useState } from 'react';
import SeatRow from '../../components/SeatRow.jsx';

export default function ReadyCard({ chat, active }) {
  const { builder, seats } = chat;
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);

  if (!active || !builder) return null;

  const send = async () => {
    setSending(true);
    await chat.submitTeam(name);
    setSending(false);
  };

  return (
    <div className="builder-card">
      <SeatRow seats={seats} />
      <div className="chips">
        {builder.picked.map((p) => (
          <button key={p.githubLogin} type="button" className="chip"
                  onClick={() => chat.removePick(p.githubLogin)}>
            Remove {p.name}
          </button>
        ))}
      </div>
      {!builder.teamId && (
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40}
               placeholder="Team name" aria-label="Team name" />
      )}
      <button type="button" className="button" onClick={send} disabled={sending}>
        {sending ? 'Sending…' : 'Send invitations'}
      </button>
    </div>
  );
}