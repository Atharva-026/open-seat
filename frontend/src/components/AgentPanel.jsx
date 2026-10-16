import { useState } from 'react';
import { useAgent } from '../hooks/useAgent.js';
import AgentSteps from './AgentSteps.jsx';
import CandidateCard from './CandidateCard.jsx';

const EXAMPLES = [
  'I need a designer and someone who knows computer vision',
  'I have a React developer. We need a backend person and someone to pitch',
  'Who from my past teams should I work with again?',
];

const ERRORS = {
  429: 'The AI service is busy. Please try again in a moment.',
};

export default function AgentPanel() {
  const { status, result, errorStatus, ask } = useAgent();
  const [text, setText] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (text.trim()) ask(text.trim());
  };

  return (
    <section className="card match">
      <h2>Ask Open Seat</h2>
      <p className="muted">
        Describe who you need in plain English. The agent searches the graph, and you can see every step it took.
      </p>

      <form onSubmit={submit} className="ask">
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500}
               placeholder="I need a designer and someone who knows computer vision"
               aria-label="Describe who you need" />
        <button className="button" type="submit" disabled={!text.trim() || status === 'loading'}>
          {status === 'loading' ? 'Thinking…' : 'Ask'}
        </button>
      </form>

      <div className="chips examples">
        {EXAMPLES.map((example) => (
          <button key={example} type="button" className="chip"
                  onClick={() => { setText(example); ask(example); }}>
            {example}
          </button>
        ))}
      </div>

      {status === 'error' && (
        <p className="muted">{ERRORS[errorStatus] ?? 'Something went wrong. Please try again.'}</p>
      )}

      {status === 'done' && (
        <div className="results">
          <p className="answer">{result.answer}</p>
          <AgentSteps steps={result.steps} />
          {result.candidates.map((c) => <CandidateCard key={c.githubLogin} candidate={c} />)}
        </div>
      )}
    </section>
  );
}