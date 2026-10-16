import { useEffect, useRef } from 'react';
import Message from './Message.jsx';
import SeatMark from '../../components/SeatMark.jsx';

export default function ChatThread({ messages, pending, proposal }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, pending]);

  return (
    <div className="thread" role="log" aria-live="polite">
      {messages.map((message) => <Message key={message.id} message={message} proposal={proposal} />)}
      {pending && (
        <div className="msg msg-bot">
          <SeatMark working />
          <p className="muted">Searching the graph…</p>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}