import { useEffect, useRef } from 'react';
import Message from './Message.jsx';
import SeatMark from '../../components/SeatMark.jsx';

export default function ChatThread({ chat }) {
  const { messages, pending } = chat;
  const threadRef = useRef(null);

  const lastWith = (flag) => [...messages].reverse().find((m) => m[flag])?.id;
  const active = { sizeAsk: lastWith('sizeAsk'), ready: lastWith('ready') };

  // Scroll to the start of the newest message, so a long answer is read from the top.
  useEffect(() => {
    const latest = threadRef.current?.querySelector('[data-latest="true"]');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    latest?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
  }, [messages, pending]);

  return (
    <div className="thread" ref={threadRef} role="log" aria-live="polite">
      {messages.map((message, i) => (
        <Message key={message.id} message={message} chat={chat} active={active}
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