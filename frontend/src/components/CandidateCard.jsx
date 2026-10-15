import IntroPath from './IntroPath.jsx';

export default function CandidateCard({ candidate }) {
  const { name, githubLogin, isDemo, score, fills, reasons } = candidate;

  return (
    <article className="candidate">
      <header>
        <div>
          <h3>{name}</h3>
          <span className="muted">@{githubLogin}</span>
          {isDemo && <span className="badge">demo persona</span>}
        </div>
        <div className="score" aria-label={`Match score ${score} out of 100`}>{score}</div>
      </header>
      <div className="chips">
        {fills.map((f) => (
          <span key={f.name} className="chip chip-fill">{f.name} · L{f.level}</span>
        ))}
      </div>
      {candidate.intro && <IntroPath intro={candidate.intro} />}
      <ul className="reasons">
        {reasons.map((reason) => <li key={reason}>{reason}</li>)}
      </ul>
    </article>
  );
}