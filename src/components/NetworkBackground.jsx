import { useEffect, useRef } from 'react';

const LINK = 140;
const MLINK = 190;
const GRID = 120;

export default function NetworkBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, dpr = 1, raf = 0, last = performance.now(), t = 0, spawn = 0;
    let nodes = [];
    const pulses = [];
    const ripples = [];
    const links = [];
    const mouse = { x: -9999, y: -9999 };

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(110, Math.round((w * h) / 13000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 22,
        vy: (Math.random() - 0.5) * 22,
        kx: 0,
        ky: 0,
        px: 0,
        py: 0,
        s: Math.random() < 0.25 ? 4 : 2,
        depth: 0.04 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2,
        warm: Math.random() < 0.1,
      }));
      pulses.length = 0;
    };

    const draw = (now) => {
      const dt = reduce ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      const scroll = window.scrollY;
      ctx.clearRect(0, 0, w, h);

      // Marcas de prancheta técnica
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(150,162,255,0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const oy = -((scroll * 0.08) % GRID);
      for (let gx = GRID / 2; gx < w; gx += GRID) {
        for (let gy = oy + GRID / 2; gy < h; gy += GRID) {
          ctx.moveTo(gx - 4, gy);
          ctx.lineTo(gx + 4, gy);
          ctx.moveTo(gx, gy - 4);
          ctx.lineTo(gx, gy + 4);
        }
      }
      ctx.stroke();

      // Ondas de clique
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rp = ripples[r];
        rp.age += dt;
        if (rp.age > 0.9) ripples.splice(r, 1);
      }

      // Atualiza pontos
      for (const n of nodes) {
        if (!reduce) {
          n.x += (n.vx + n.kx) * dt;
          n.y += (n.vy + n.ky) * dt;
          const decay = Math.pow(0.05, dt);
          n.kx *= decay;
          n.ky *= decay;
          if (n.x < -10) n.x = w + 10;
          if (n.x > w + 10) n.x = -10;
        }
        n.px = n.x;
        n.py = (((n.y - scroll * n.depth) % (h + 20)) + (h + 20)) % (h + 20) - 10;
        if (!reduce) {
          const dm = Math.hypot(n.px - mouse.x, n.py - mouse.y);
          if (dm < MLINK) {
            n.x += (mouse.x - n.px) * dt * 0.35;
            n.y += (mouse.y - n.py) * dt * 0.35;
          }
          for (const rp of ripples) {
            const radius = rp.age * 420;
            const dx = n.px - rp.x;
            const dy = n.py - rp.y;
            const d = Math.hypot(dx, dy) || 1;
            if (Math.abs(d - radius) < 36) {
              const fade = 1 - rp.age / 0.9;
              n.kx += (dx / d) * 1400 * dt * fade;
              n.ky += (dy / d) * 1400 * dt * fade;
            }
          }
        }
      }

      // Ligações tracejadas que "caminham"
      links.length = 0;
      ctx.setLineDash([3, 5]);
      ctx.lineDashOffset = -t * 10;
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.px - b.px, a.py - b.py);
          if (d < LINK) {
            links.push(i, j);
            ctx.strokeStyle = `rgba(140,155,255,${(1 - d / LINK) * 0.32})`;
            ctx.beginPath();
            ctx.moveTo(a.px, a.py);
            ctx.lineTo(b.px, b.py);
            ctx.stroke();
          }
        }
        const dm = Math.hypot(a.px - mouse.x, a.py - mouse.y);
        if (dm < MLINK) {
          ctx.setLineDash([2, 3]);
          ctx.strokeStyle = `rgba(255,200,87,${(1 - dm / MLINK) * 0.6})`;
          ctx.beginPath();
          ctx.moveTo(a.px, a.py);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
          ctx.setLineDash([3, 5]);
        }
      }
      ctx.setLineDash([]);

      // Pulsos viajando pelas ligações
      if (!reduce) {
        spawn -= dt;
        if (spawn <= 0 && pulses.length < 18 && links.length) {
          const k = Math.floor(Math.random() * (links.length / 2)) * 2;
          pulses.push({ a: links[k], b: links[k + 1], u: 0, speed: 0.9 + Math.random() * 0.9, warm: Math.random() < 0.35 });
          spawn = 0.18;
        }
        for (let p = pulses.length - 1; p >= 0; p--) {
          const pu = pulses[p];
          const a = nodes[pu.a];
          const b = nodes[pu.b];
          pu.u += dt * pu.speed;
          if (!a || !b || pu.u >= 1 || Math.hypot(a.px - b.px, a.py - b.py) > LINK * 1.3) {
            pulses.splice(p, 1);
            continue;
          }
          ctx.fillStyle = pu.warm ? '#ffc857' : '#c9d0ff';
          for (let k = 0; k < 4; k++) {
            const u = pu.u - k * 0.06;
            if (u < 0) continue;
            const size = k === 0 ? 3 : 2;
            ctx.globalAlpha = [0.95, 0.55, 0.3, 0.15][k];
            ctx.fillRect(a.px + (b.px - a.px) * u - size / 2, a.py + (b.py - a.py) * u - size / 2, size, size);
          }
        }
        ctx.globalAlpha = 1;
      }

      // Pontos quadrados que piscam
      for (const n of nodes) {
        const blink = reduce ? 0.7 : 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.4 + n.phase));
        ctx.globalAlpha = blink;
        const color = n.warm ? '#ffc857' : '#bec6ff';
        if (n.s > 2) {
          ctx.strokeStyle = color;
          ctx.strokeRect(Math.round(n.px - n.s / 2) + 0.5, Math.round(n.py - n.s / 2) + 0.5, n.s, n.s);
        } else {
          ctx.fillStyle = color;
          ctx.fillRect(Math.round(n.px - 1), Math.round(n.py - 1), 2, 2);
        }
      }
      ctx.globalAlpha = 1;

      // Ondas de clique (desenho)
      ctx.setLineDash([4, 6]);
      for (const rp of ripples) {
        const fade = 1 - rp.age / 0.9;
        ctx.strokeStyle = `rgba(255,200,87,${0.5 * fade})`;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.age * 420, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Mira ao redor do cursor
      if (!reduce && mouse.x > 0) {
        const m = 10;
        ctx.strokeStyle = 'rgba(255,200,87,0.45)';
        ctx.strokeRect(Math.round(mouse.x - m) + 0.5, Math.round(mouse.y - m) + 0.5, m * 2, m * 2);
        ctx.fillStyle = 'rgba(255,200,87,0.9)';
        for (const [cx, cy] of [[-m, -m], [m, -m], [m, m], [-m, m]]) {
          ctx.fillRect(Math.round(mouse.x + cx) - 1, Math.round(mouse.y + cy) - 1, 3, 3);
        }
      }

      if (!reduce) raf = requestAnimationFrame(draw);
    };

    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    const onDown = (e) => { if (!reduce) ripples.push({ x: e.clientX, y: e.clientY, age: 0 }); };
    const onResize = () => { build(); if (reduce) draw(performance.now()); };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };

    build();
    draw(performance.now());
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onLeave);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <div className="bg" aria-hidden="true">
      <canvas ref={ref} className="bg-canvas" />
    </div>
  );
}
