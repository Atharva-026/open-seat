import { useLocation, useOutletContext } from 'react-router-dom';
import { PALETTE_KEY } from '../lib/shortcuts.js';
import EmptyChat from '../features/chat/EmptyChat.jsx';
import ChatThread from '../features/chat/ChatThread.jsx';
import Composer from '../features/chat/Composer.jsx';
import PartyBar from '../features/chat/PartyBar.jsx';

export default function FindPage() {
  const { chat, proposal, profile, openPalette } = useOutletContext();
  const { state } = useLocation();
  const started = chat.messages.length > 0 || chat.pending;

  return (
    <section className="chat">
      <header className="chat-head">
        <h1>Find teammates</h1>
        <div className="chat-actions">
          {started && (
            <button type="button" className="link-btn" onClick={chat.reset} disabled={chat.pending}>
              New chat
            </button>
          )}
          <button type="button" className="kbd-btn" onClick={openPalette} aria-label="Open the command menu">
            <kbd>{PALETTE_KEY}</kbd>
          </button>
        </div>
      </header>

      {started
        ? <ChatThread messages={chat.messages} pending={chat.pending} proposal={proposal} onRetry={chat.retry} />
        : <EmptyChat name={profile.name} onPick={chat.send} />}

      <div className="dock">
        <PartyBar proposal={proposal} myName={profile.name} />
        <Composer onSend={chat.send} disabled={chat.pending} initialText={state?.draft ?? ''} />
        <p className="dock-hint">Enter to send · Shift+Enter for a new line · {PALETTE_KEY} for commands</p>
      </div>
    </section>
  );
}