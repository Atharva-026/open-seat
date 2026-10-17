import SeatMark from '../../components/SeatMark.jsx';
import AgentSteps from './AgentSteps.jsx';
import CandidateRow from './CandidateRow.jsx';

export default function Message({ message, proposal, onRetry, latest }) {
  const marker = latest ? 'true' : undefined;

  if (message.role === 'user') {
    return (
      <div className="msg msg-user" data-latest={marker}>
        <p>{message.text}</p>
      </div>
    );
  }

  return (
    <div className={`msg msg-bot ${message.failed ? 'msg-failed' : ''}`} data-latest={marker}>
      <SeatMark />
      <div className="msg-body">
        <p className="msg-text">{message.text}</p>
        {message.failed && <button type="button" className="link-btn" onClick={onRetry}>Try again</button>}
        {message.steps?.length > 0 && <AgentSteps steps={message.steps} />}
        {message.candidates?.length > 0 && (
          <ul className="cand-list">
            {message.candidates.map((candidate) => (
              <CandidateRow
                key={candidate.githubLogin}
                candidate={candidate}
                added={proposal.has(candidate.githubLogin)}
                canAdd={proposal.canAdd}
                onToggle={proposal.toggle}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}