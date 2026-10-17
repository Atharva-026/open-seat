import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { API_URL } from '../../config.js';

const PROMPT = 'I need a designer and someone who knows computer vision';
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function useTyped(text, start) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return undefined;
    if (reduceMotion()) {
      setCount(text.length);
      return undefined;
    }
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) clearInterval(timer);
    }, 38);
    return () => clearInterval(timer);
  }, [text, start]);

  return count;
}

export default function Hero({ ready }) {
  const rootRef = useRef(null);
  const [typing, setTyping] = useState(false);
  const typed = useTyped(PROMPT, typing);
  const finished = typed >= PROMPT.length;

  useLayoutEffect(() => {
    if (!ready) return undefined;
    if (reduceMotion()) {
      setTyping(true);
      return undefined;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-line > span', { yPercent: 110 }, {
        yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.12,
      });
    }, rootRef);
    const timer = setTimeout(() => setTyping(true), 800);
    return () => { clearTimeout(timer); ctx.revert(); };
  }, [ready]);

  return (
    <section className="hero" ref={rootRef}>
      <h1 style={{ opacity: ready ? 1 : 0 }}>
        <span className="hero-line"><span>Fill the</span></span>
        <span className="hero-line"><span>empty seat.</span></span>
      </h1>

      <p className="prompt-line" aria-label={PROMPT}>
        <span aria-hidden="true">{PROMPT.slice(0, typed)}</span>
        <span className="caret" aria-hidden="true" />
      </p>

      <ul className="legend">
        <li><i className="seat seat-sm seat-filled" /> you typed this</li>
        <li className={finished ? 'on' : ''}>
          <i className="seat seat-sm" /> the agent searched the graph, 2 tool calls, 6 people found (example)
        </li>
        <li><i className="plus">+</i> move your cursor: every square is a person</li>
      </ul>

      <p className="hero-copy">
        Open Seat reads the projects you have built, finds the people who cover what your team is
        missing, and shows you how it found each one.
      </p>

      <div className="hero-actions">
        <a className="pill" href={`${API_URL}/auth/github`}>Sign in with GitHub</a>
        <a className="pill pill-ghost" href="#how">How it works</a>
      </div>
    </section>
  );
}