import { useEffect, useRef } from 'react';

const EDGE_DIST = 150;
const HOVER_DIST = 170;

// Demo personas, so the labels match what the product really shows.
const PEOPLE = [
  ['demo-neel-15', 'Computer Vision', 5], ['demo-sana-16', 'UI/UX Design', 4],
  ['demo-ananya-6', 'UI/UX Design', 5], ['demo-pooja-18', 'Product Pitching', 5],
  ['demo-hana-28', 'Product Pitching', 5], ['demo-leo-25', 'TensorFlow', 5],
  ['demo-meera-4', 'Python', 5], ['demo-ravi-35', 'Computer Vision', 4],
  ['demo-aditya-19', 'Python', 5], ['demo-ishita-8', 'Product Pitching', 3],
];

function seededRandom(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function GraphField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const css = getComputedStyle(document.documentElement);
    const paper = css.getPropertyValue('--paper').trim() || '#ecebe4';
    const seat = css.getPropertyValue('--seat').trim() || '#ffb81f';

    let width = 0;
    let height = 0;
    let nodes = [];
    let raf = 0;
    const pointer = { x: -1000, y: -1000, active: false };
    const marker = { x: 0, y: 0 };

    const line = (x1, y1, x2, y2) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const rand = seededRandom(2026);
      const count = Math.min(80, Math.round((width * height) / 20000));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: rand() * width,
        y: rand() * height,
        vx: (rand() - 0.5) * 0.25,
        vy: (rand() - 0.5) * 0.25,
        person: PEOPLE[i] ?? null,
      }));
    };

    const drawBase = () => {
      ctx.lineWidth = 1;
      ctx.strokeStyle = paper;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < EDGE_DIST) {
            ctx.globalAlpha = 0.12 * (1 - d / EDGE_DIST);
            line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
          }
        }
      }
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = paper;
      nodes.forEach((n) => ctx.fillRect(n.x - 2, n.y - 2, 4, 4));
    };

    const drawPointer = () => {
      let near = null;
      let best = HOVER_DIST;
      nodes.forEach((n) => {
        const d = Math.hypot(n.x - pointer.x, n.y - pointer.y);
        if (d < best) { best = d; near = n; }
      });

      marker.x += ((near ? near.x : pointer.x) - marker.x) * 0.2;
      marker.y += ((near ? near.y : pointer.y) - marker.y) * 0.2;

      ctx.strokeStyle = paper;
      ctx.globalAlpha = 0.14;
      line(0, marker.y, width, marker.y);
      line(marker.x, 0, marker.x, height);
      if (!near) return;

      ctx.strokeStyle = seat;
      ctx.fillStyle = seat;
      ctx.globalAlpha = 0.9;
      let links = 0;
      nodes.forEach((n) => {
        if (n !== near && Math.hypot(n.x - near.x, n.y - near.y) < EDGE_DIST * 1.3) {
          line(near.x, near.y, n.x, n.y);
          ctx.fillRect(n.x - 3, n.y - 3, 6, 6);
          links += 1;
        }
      });
      ctx.fillRect(near.x - 5, near.y - 5, 10, 10);

      const flip = near.x > width - 280;
      ctx.textAlign = flip ? 'right' : 'left';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = paper;
      const x = near.x + (flip ? -14 : 14);
      const title = near.person ? `${near.person[0]} · ${near.person[1]} L${near.person[2]}` : 'person';
      ctx.fillText(title.toUpperCase(), x, near.y + 22);
      ctx.globalAlpha = 0.55;
      ctx.fillText(`${links} CONNECTIONS`, x, near.y + 38);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      drawBase();
      if (pointer.active) drawPointer();
      ctx.globalAlpha = 1;
    };

    const frame = () => {
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      });
      draw();
      raf = requestAnimationFrame(frame);
    };

    const onMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = finePointer && !reduce;
    };
    const onLeave = () => { pointer.active = false; };
    const onResize = () => { build(); if (reduce) draw(); };

    build();
    if (reduce) draw(); else raf = requestAnimationFrame(frame);

    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="field" aria-hidden="true" />;
}