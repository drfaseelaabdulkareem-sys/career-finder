import { useEffect, useRef } from 'react';

// A single burst when the results appear. No library — about forty
// lines of canvas. It runs once, then stops and clears itself, so it
// never sits in the background eating battery.
export default function Confetti() {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.width / dpr;
    const H = () => canvas.height / dpr;
    const COLOURS = ['#C9F24D', '#F6C544', '#4E95D2', '#2E5C4E', '#FFFFFF', '#E86A5A'];

    // Two poppers, firing inward from the lower corners.
    const pieces = [];
    const burst = (originX, originY, angle) => {
      for (let i = 0; i < 70; i++) {
        const spread = (Math.random() - 0.5) * 0.9;
        const speed = 9 + Math.random() * 13;
        pieces.push({
          x: originX, y: originY,
          vx: Math.cos(angle + spread) * speed,
          vy: Math.sin(angle + spread) * speed,
          w: 5 + Math.random() * 7,
          h: 3 + Math.random() * 5,
          rot: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.3,
          colour: COLOURS[(Math.random() * COLOURS.length) | 0],
          life: 1,
        });
      }
    };
    burst(0, H(), -Math.PI / 3.4);
    burst(W(), H(), -Math.PI + Math.PI / 3.4);

    let raf;
    const tick = () => {
      ctx.clearRect(0, 0, W(), H());
      let alive = 0;

      for (const p of pieces) {
        p.vy += 0.34;          // gravity
        p.vx *= 0.992;         // drag
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.spin;
        p.life -= 0.0075;

        if (p.life <= 0 || p.y > H() + 40) continue;
        alive++;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.colour;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (alive > 0) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W(), H());
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas className="confetti" ref={ref} aria-hidden="true" />;
}
