import { useEffect, useRef, useState } from 'react';

export default function SeatStrip({ filled, total = 4 }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSeen(true);
        observer.disconnect();
      }
    }, { threshold: 0.6 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="seat-strip" ref={ref} role="img" aria-label={`${filled} of ${total} seats filled`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`seat ${seen && i < filled ? 'seat-filled' : ''}`}
              style={{ transitionDelay: `${i * 140}ms` }} />
      ))}
    </div>
  );
}