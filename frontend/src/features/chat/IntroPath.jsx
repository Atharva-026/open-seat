import { Fragment } from 'react';

export default function IntroPath({ intro }) {
  const label = intro.chain.map((n) => n.name).join(' to ');

  return (
    <div className="intro" role="img" aria-label={`Warm intro path: ${label}`}>
      {intro.chain.map((node, i) => (
        <Fragment key={`${node.role}-${node.name}`}>
          {i > 0 && <span className="intro-edge">★ {intro.ratings[i - 1]}</span>}
          <span className={`intro-node intro-${node.role}`}>{node.name}</span>
        </Fragment>
      ))}
    </div>
  );
}