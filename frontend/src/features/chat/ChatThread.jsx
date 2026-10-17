import { useEffect, useRef } from 'react';
import Message from './Message.jsx';
import SeatMark from '../../components/SeatMark.jsx';

export default function ChatThread({ messages, pending, proposal, onRetry }) {
  const threadRef = useRef(null);

  // Scroll to the start of the newest message, so a long answer is read from the top.
  useEffect(() => {
    const latest = threadRef.current?.querySelector('[data-latest="true"]');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    latest?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
  }, [messages, pending]);

  return (
    <div className="thread" ref={threadRef} role="log" aria-live="polite">
      {messages.map((message, i) => (
        <Message key={message.id} message={message} proposal={proposal} onRetry={onRetry}
                 latest={!pending && i === messages.length - 1} />
      ))}
      {pending && (
        <div className="msg msg-bot" data-latest="true">
          <SeatMark working />
          <p className="muted">Searching the graph…</p>
        </div>
      )}
    </div>
  );
}