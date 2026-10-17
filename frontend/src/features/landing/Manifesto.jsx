import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TEXT =
  'Finding teammates is mostly luck. Open Seat reads what you have built, finds who covers the gap, and shows the path to reach them.';

export default function Manifesto() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo('.word', { opacity: 0.16 }, {
        opacity: 1,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top 75%', end: 'bottom 50%', scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="manifesto" ref={ref}>
      <p>
        {TEXT.split(' ').map((word, i) => (
          <span key={`${word}-${i}`} className="word">{word} </span>
        ))}
      </p>
    </section>
  );
}