import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const SEEN_KEY = 'open-seat-intro-seen';

function shouldSkip() {
  try {
    return (
      sessionStorage.getItem(SEEN_KEY) === '1' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  } catch {
    return false;
  }
}

// The one orchestrated moment: four seats fill, then the curtain lifts. Once per session.
export default function Loader({ onDone }) {
  const rootRef = useRef(null);
  const [skip] = useState(shouldSkip);
  const [percent, setPercent] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (skip) {
      onDone();
      return undefined;
    }
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* storage unavailable */ }

    const counter = { value: 0 };
    const timeline = gsap.timeline({ onComplete: () => { setGone(true); onDone(); } });
    timeline
      .to(counter, {
        value: 100,
        duration: 1.3,
        ease: 'power2.inOut',
        onUpdate: () => setPercent(Math.round(counter.value)),
      })
      .to(rootRef.current, { yPercent: -100, duration: 0.7, ease: 'power3.inOut' }, '+=0.15');
    return () => timeline.kill();
  }, [skip, onDone]);

  if (skip || gone) return null;

  const filled = percent >= 100 ? 4 : Math.floor(percent / 25);
  return (
    <div className="loader" ref={rootRef} role="status" aria-label="Loading">
      <div className="seat-strip">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`seat ${i < filled ? 'seat-filled' : ''}`} />
        ))}
      </div>
      <p className="loader-count">Seating… {percent}%</p>
    </div>
  );
}