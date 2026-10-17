import { Link } from 'react-router-dom';
import SeatMark from '../../components/SeatMark.jsx';
import SeatRow from '../../components/SeatRow.jsx';
import AgentSteps from './AgentSteps.jsx';
import CandidateRow from './CandidateRow.jsx';
import SizeChoices from './SizeChoices.jsx';
import ReadyCard from './ReadyCard.jsx';
import { filledCount, isFull } from './teamBuilder.js';

export default function Message({ message, chat, active, latest }) {
  const { builder } = chat;
  const marker = latest ? 'true' : undefined;

  if (message.role === 'user') {
    return (
      <div className="msg msg-user" data-latest={marker}>
        <p>{message.text}</p>
      </div>
    );
  }

  const sizeActive = builder?.stage === 'size' && message.sizeAsk && active.sizeAsk === message.id;
  const readyActive = builder?.stage === 'ready' && message.ready && active.ready === message.id;
  const taken = builder ? [...builder.fixed, ...builder.picked].map((p) => p.githubLogin) : [];
  const locked = Boolean(builder && (builder.stage === 'ready' || isFull(builder)));
  const actionLabel = builder?.size ? `Choose for seat ${filledCount(builder) + 1}` : 'Add to team';

  return (
    <div className={`msg msg-bot ${message.failed ? 'msg-failed' : ''}`} data-latest={marker}>
      <SeatMark />
      <div className="msg-body">
        <p className="msg-text">{message.text}</p>
        {message.failed && message.kind === 'text' && (
          <button type="button" className="link-btn" onClick={chat.retry}>Try again</button>
        )}
        {message.seats && <SeatRow seats={message.seats} />}
        {sizeActive && <SizeChoices builder={builder} onChoose={chat.chooseSize} />}
        {message.ready && <ReadyCard chat={chat} active={readyActive} />}
        {message.sent && <Link className="link-btn" to="/app/teams">Open Teams</Link>}
        {message.steps?.length > 0 && <AgentSteps steps={message.steps} />}
        {message.candidates?.length > 0 && (
          <ul className="cand-list">
            {message.candidates.map((candidate) => (
              <CandidateRow
                key={candidate.githubLogin}
                candidate={candidate}
                chosen={taken.includes(candidate.githubLogin)}
                disabled={locked}
                actionLabel={actionLabel}
                onAction={chat.pick}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}