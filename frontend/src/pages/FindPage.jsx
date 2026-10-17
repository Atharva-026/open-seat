import { useEffect } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { PALETTE_KEY } from '../lib/shortcuts.js';
import EmptyChat from '../features/chat/EmptyChat.jsx';
import ChatThread from '../features/chat/ChatThread.jsx';
import Composer from '../features/chat/Composer.jsx';
import { composerPlaceholder } from '../features/chat/teamBuilder.js';

export default function FindPage() {
  const { chat, profile, openPalette } = useOutletContext();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { startFill } = chat;
  const started = chat.messages.length > 0 || chat.pending;

  // Arriving from Teams with "Fill open seats": continue that team in the chat.
  useEffect(() => {
    if (!state?.fill) return;
    startFill(state.fill, profile.githubLogin);
    navigate('/app/find', { replace: true, state: null });
  }, [state, startFill, profile.githubLogin, navigate]);

  return (
    <section className="chat">
      <header className="chat-head">
        <h1>Find teammates</h1>
        <div className="chat-actions">
          {chat.builder && (
            <button type="button" className="link-btn" onClick={chat.cancel}>Cancel team</button>
          )}
          {started && !chat.builder && (
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
        ? <ChatThread chat={chat} />
        : <EmptyChat name={profile.name} onPick={chat.send} onBuild={chat.startBuilder} />}

      <div className="dock">
        <Composer onSend={chat.send} disabled={chat.pending} placeholder={composerPlaceholder(chat.builder)} />
        <p className="dock-hint">Enter to send · Shift+Enter for a new line · {PALETTE_KEY} for commands</p>
      </div>
    </section>
  );
}