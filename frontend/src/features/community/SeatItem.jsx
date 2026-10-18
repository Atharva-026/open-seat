import { useState } from 'react';
import IntroPath from '../chat/IntroPath.jsx';

const STATUS_TEXT = {
  pending: 'Requested. Waiting for the team to answer.',
  accepted: 'Accepted. You are on this team now.',
  declined: 'The team declined this request.',
};

export default function SeatItem({ seat, onRequest }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  const send = async () => {
    setSending(true);
    setFailed(false);
    try {
      await onRequest(seat.id, message.trim());
      setOpen(false);
      setMessage('');
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <li className="seat-item">
      <div className={`seat-fit ${seat.canFill ? 'seat-fit-ok' : ''}`} aria-label={`Fit score ${seat.score} out of 100`}>
        <span>{seat.score}</span>
        <small>fit</small>
      </div>

      <div className="seat-main">
        <h3>{seat.title}</h3>
        <p className="muted">
          {seat.teamName}, led by {seat.ownerName ?? 'a teammate'}
          {seat.isDemo && <span className="badge">demo team</span>}
          {' · '}{seat.memberCount} of {seat.size} seats filled
        </p>
        {seat.pitch && <p>{seat.pitch}</p>}
        <ul className="needs">
          {seat.needs.map((need) => (
            <li key={need.name} className={need.level >= 3 ? 'need need-ok' : 'need'}>
              {need.name}
              <small>{need.level ? `you: level ${need.level}` : 'you: none yet'}</small>
            </li>
          ))}
        </ul>
        {seat.intro && <IntroPath intro={seat.intro} />}
        <details className="cand-why">
          <summary>Why this fit</summary>
          <ul>{seat.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        </details>
      </div>

      <div className="seat-action">
        {seat.myRequest && <p className="muted">{STATUS_TEXT[seat.myRequest]}</p>}
        {!seat.myRequest && !open && (
          <button type="button" className="seat-btn" onClick={() => setOpen(true)}>Request this seat</button>
        )}
        {!seat.myRequest && open && (
          <div className="request-form">
            <input value={message} onChange={(e) => setMessage(e.target.value)} maxLength={140}
                   placeholder="One line on why you fit (optional)" aria-label="Message to the team" />
            <div className="chips">
              <button type="button" className="button" onClick={send} disabled={sending}>
                {sending ? 'Sending…' : 'Send request'}
              </button>
              <button type="button" className="link-btn" onClick={() => setOpen(false)}>Cancel</button>
            </div>
            {failed && <p className="muted">Could not send the request. Please try again.</p>}
          </div>
        )}
      </div>
    </li>
  );
}