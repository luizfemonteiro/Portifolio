import { useEffect, useRef, useState } from 'react';

export function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  // Mede pela posição na tela (em vez de IntersectionObserver, que não "vê" elementos escondidos por clip-path).
  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return undefined;
    let raf = 0;
    const check = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      const need = Math.max(1, Math.min(r.height * threshold, vh * 0.25));
      if (visible >= need) setShown(true);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    const late = setTimeout(check, 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      clearTimeout(late);
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [shown, threshold]);

  return [ref, shown];
}

// Revelação "varredura": o bloco aparece de cima para baixo, com uma linha amarela passando.
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, style = {}, ...rest }) {
  const [ref, shown] = useInView(0.12);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!shown) return undefined;
    const id = setTimeout(() => setDone(true), 1400 + delay);
    return () => clearTimeout(id);
  }, [shown, delay]);

  return (
    <Tag
      ref={ref}
      className={`scan ${shown ? 'is-in' : ''} ${done ? 'done' : ''} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms`, '--d': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
