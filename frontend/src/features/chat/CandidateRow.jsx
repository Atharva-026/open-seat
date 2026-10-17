import IntroPath from './IntroPath.jsx';

export default function CandidateRow({ candidate, added, canAdd, onToggle }) {
  const { name, githubLogin, isDemo, score, fills, reasons, intro } = candidate;

  return (
    <li className="cand">
      <span className={`cand-seat ${added ? 'cand-seat-on' : ''}`} aria-hidden="true">{name.slice(0, 1)}</span>
      <div className="cand-main">
        <div className="cand-head">
          <strong>{name}</strong>
          <span className="muted">@{githubLogin}</span>
          {isDemo && <span className="badge">demo persona</span>}
        </div>
        <p className="cand-skills">{fills.map((f) => `${f.name} (level ${f.level})`).join(', ')}</p>
        {intro && <IntroPath intro={intro} />}
        <details className="cand-why">
          <summary>Why this match</summary>
          <ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        </details>
      </div>
      <div className="cand-side">
        <span className="cand-score" title="Match score out of 100">{score}</span>
        <button type="button" className={added ? 'link-btn' : 'seat-btn'}
                disabled={!added && !canAdd} onClick={() => onToggle(candidate)}>
          {added ? 'Remove' : 'Add to team'}
        </button>
      </div>
    </li>
  );
}