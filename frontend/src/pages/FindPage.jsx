import { useLocation, useOutletContext } from 'react-router-dom';
import EmptyChat from '../features/chat/EmptyChat.jsx';
import ChatThread from '../features/chat/ChatThread.jsx';
import Composer from '../features/chat/Composer.jsx';
import ProposalTray from '../features/chat/ProposalTray.jsx';

export default function FindPage() {
  const { chat, proposal, profile } = useOutletContext();
  const { state } = useLocation();
  const started = chat.messages.length > 0 || chat.pending;

  return (
    <section className="chat">
      {started
        ? <ChatThread messages={chat.messages} pending={chat.pending} proposal={proposal} />
        : <EmptyChat name={profile.name} onPick={chat.send} />}
      <div className="dock">
        <ProposalTray proposal={proposal} />
        <Composer onSend={chat.send} disabled={chat.pending} initialText={state?.draft ?? ''} />
      </div>
    </section>
  );
}