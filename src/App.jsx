import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowDown01Icon,
  Menu01Icon,
  Cancel01Icon,
  Mortarboard01Icon,
  Briefcase01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Mail01Icon,
  GithubIcon,
  Linkedin01Icon,
  InstagramIcon,
  ArrowUpRight01Icon,
  Image01Icon,
} from '@hugeicons/core-free-icons';
import NetworkBackground from './components/NetworkBackground.jsx';
import TechText from './components/TechText.jsx';
import CardSwap, { Card } from './components/CardSwap.jsx';
import ContactArea from './components/contact-area.tsx';
import Reveal, { useInView } from './components/Reveal.jsx';
import SectionTitle from './components/SectionTitle.jsx';
import { base, contact } from './data.js';
import { useLang } from './i18n.jsx';
import { handleCvClick } from './cv.js';

// Coloque sua foto em src/assets/foto.jpg (ou .png / .webp) e currículo em src/assets/curriculo.pdf
const photoFiles = import.meta.glob('./assets/foto.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' });
const cvFiles = import.meta.glob('./assets/curriculo.pdf', { eager: true, query: '?url', import: 'default' });
const photoUrl = Object.values(photoFiles)[0];
const cvUrl = Object.values(cvFiles)[0];

// Carrega automaticamente imagens dos projetos colocadas em src/assets/ (ex: projeto-cortes.jpg, projeto-alfred.png, etc)
const projectImgs = import.meta.glob('./assets/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' });
const getProjectImg = (name) => {
  if (!name) return undefined;
  // Normaliza removendo acentos E hífens/underscores para comparar sem pontuação
  const strip = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  const norm = strip(name);
  return Object.entries(projectImgs).find(([path]) => {
    // Pega só o nome do arquivo (sem extensão) e normaliza do mesmo jeito
    const fileName = path.split('/').pop().replace(/\.[^.]+$/, '');
    return strip(fileName).includes(norm) || norm.includes(strip(fileName));
  })?.[1];
};

const sectionIds = ['sobre', 'trajetoria', 'projetos', 'habilidades', 'contato'];

function WhatsappIcon({ size = 20, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2ZM12.04 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.04 20.16C10.66 20.16 9.3 19.8 8.1 19.11L7.81 18.94L4.69 19.76L5.52 16.71L5.33 16.4C4.58 15.2 4.19 13.82 4.19 11.92C4.19 7.38 7.89 3.67 12.04 3.67ZM8.82 7.15C8.64 7.15 8.35 7.22 8.11 7.48C7.87 7.74 7.2 8.36 7.2 9.63C7.2 10.9 8.13 12.13 8.26 12.3C8.39 12.47 10.08 15.08 12.67 16.2C13.29 16.46 13.77 16.62 14.15 16.74C14.77 16.94 15.34 16.91 15.79 16.84C16.29 16.77 17.33 16.21 17.55 15.59C17.77 14.97 17.77 14.44 17.7 14.33C17.63 14.22 17.46 14.15 17.2 14.02C16.94 13.89 15.66 13.26 15.42 13.17C15.18 13.08 15.01 13.04 14.84 13.3C14.67 13.56 14.18 14.15 14.03 14.33C13.88 14.5 13.73 14.52 13.47 14.39C13.21 14.26 12.38 13.99 11.4 13.11C10.63 12.42 10.11 11.58 9.96 11.32C9.81 11.06 9.94 10.92 10.07 10.79C10.19 10.67 10.34 10.48 10.47 10.33C10.6 10.18 10.65 10.07 10.74 9.9C10.83 9.73 10.78 9.58 10.72 9.45C10.66 9.32 10.18 8.14 9.98 7.66C9.79 7.19 9.59 7.25 9.44 7.24C9.3 7.24 9.13 7.24 8.96 7.24L8.82 7.15Z" />
    </svg>
  );
}

const Icon = ({ icon, size = 20 }) => {
  if (typeof icon === 'function') {
    const Custom = icon;
    return <Custom size={size} />;
  }
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8} />;
};

function useNarrow(max = 640) {
  const query = `(max-width: ${max}px)`;
  const [narrow, setNarrow] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setNarrow(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return narrow;
}

function LangSwitch() {
  const { lang, setLang, t } = useLang();
  return (
    <div className="lang" role="group" aria-label={t.ui.langLabel}>
      {['pt', 'en'].map((l) => (
        <button key={l} type="button" className={lang === l ? 'on' : ''} aria-pressed={lang === l} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function Nav() {
  const { t } = useLang();
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <header className="nav">
      <div className="nav-bar">
        <a href="#top" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">
            {photoUrl ? <img src={photoUrl} alt={base.name} className="brand-photo" /> : 'LF'}
          </span>
          <span className="brand-name">Luiz Felipe</span>
        </a>
        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label={t.ui.navLabel}>
          {t.nav.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={id === 'contato' ? 'nav-cta' : active === id ? 'active' : ''} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
        <div className="nav-right">
          <LangSwitch />
          <button className="nav-toggle" onClick={() => setOpen((v) => !v)} aria-label={open ? t.ui.menuClose : t.ui.menuOpen} aria-expanded={open}>
            <Icon icon={open ? Cancel01Icon : Menu01Icon} size={22} />
          </button>
        </div>
      </div>
      <div className="progress" style={{ transform: `scaleX(${progress})` }} />
    </header>
  );
}

function Photo() {
  const { t } = useLang();
  return (
    <div className="photo">
      <div className="photo-frame" />
      <div className="photo-shape">
        {photoUrl ? (
          <img src={photoUrl} alt={`${t.ui.photoAlt} ${base.name}`} />
        ) : (
          <div className="photo-empty">
            <span>LF</span>
            <small>{t.ui.photoHint}</small>
          </div>
        )}
      </div>
    </div>
  );
}

function Hero() {
  const { t } = useLang();
  const narrow = useNarrow(860);
  // Ao rolar, o início se afasta em camadas (nome, texto e foto em velocidades diferentes).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.8)));
      document.documentElement.style.setProperty('--hp', p.toFixed(4));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <section id="top" className="hero">
      <div className="wrap hero-stack">
        <h1 className="sr-only">{base.name}</h1>
        <div aria-hidden="true" className="hero-title">
          <TechText
            text={base.shortName}
            fontFamily="'Bricolage Grotesque', 'Segoe UI', sans-serif"
            fontWeight={800}
            fontSize={narrow ? 110 : 190}
            letterSpacing={-0.03}
            align="left"
            reveal="letter"
            dashLength={2}
            dashGap={2}
            specks={narrow ? 16 : 32}
            intro="assemble"
            introDuration={narrow ? 1.6 : 2.2}
            clickKick
            guides={false}
            accentColor="#ffc857"
            strokeWidth={1}
            className="hero-title-canvas"
            bleedX={narrow ? 20 : 120}
            bleedY={narrow ? 30 : 130}
          />
        </div>
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="hero-text">{t.hero.headline}</p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#projetos">
                {t.hero.seeProjects}
                <Icon icon={ArrowDown01Icon} size={18} />
              </a>
              <a className="btn btn-ghost" href="#contato">{t.hero.talk}</a>
              {cvUrl && (
                <a className="btn btn-ghost" href={cvUrl} download={t.contact.cvFile} onClick={(e) => handleCvClick(e, cvUrl, t.contact.cvFile)}>{t.contact.cv}</a>
              )}
            </div>
            <ul className="hero-social" aria-label={t.ui.socialLabel}>
              {[
                [WhatsappIcon, 'WhatsApp', contact.whatsapp],
                [Linkedin01Icon, 'LinkedIn', contact.linkedin],
                [GithubIcon, 'GitHub', contact.github],
                [InstagramIcon, 'Instagram', contact.instagram],
                [Mail01Icon, t.ui.email, `mailto:${contact.email}`],
              ].map(([ic, label, href]) => (
                <li key={label}>
                  <a href={href} aria-label={label} title={label} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    <Icon icon={ic} size={20} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <Photo />
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const { t } = useLang();
  const items = t.marquee.items;
  const wrapRef = useRef(null);
  const trackRef = useRef(null);

  // A faixa anda sozinha, acelera quando você rola a página e muda de direção conforme a rolagem.
  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const row = track.firstElementChild;
    let x = 0;
    let dir = -1;
    let boost = 0;
    let lastY = window.scrollY;
    let last = performance.now();
    let hover = false;
    let visible = true;
    let raf = 0;
    const tick = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (visible) {
        const speed = Math.min(Math.abs(dy / dt), 3000) / 3000;
        boost += (speed * 700 - boost) * Math.min(1, dt * 6);
        if (Math.abs(dy) > 0.5) dir = dy > 0 ? -1 : 1;
        x += dir * ((hover ? 0 : 55) + boost) * dt;
        const w = row.offsetWidth;
        if (w > 0) {
          x %= w;
          if (x > 0) x -= w;
        }
        track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(wrap);
    const enter = () => { hover = true; };
    const leave = () => { hover = false; };
    wrap.addEventListener('pointerenter', enter);
    wrap.addEventListener('pointerleave', leave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      wrap.removeEventListener('pointerenter', enter);
      wrap.removeEventListener('pointerleave', leave);
    };
  }, []);

  const row = (key, hidden) => (
    <ul className="marquee-row" key={key} aria-hidden={hidden || undefined}>
      {items.map((it) => (
        <li key={it}>
          <span className="marquee-sq" aria-hidden="true" />
          {it}
        </li>
      ))}
    </ul>
  );
  return (
    <div ref={wrapRef} className="marquee" role="group" aria-label={`${t.marquee.label}: ${items.join(', ')}`}>
      <div ref={trackRef} className="marquee-track">
        {[0, 1, 2, 3].map((k) => row(k, k > 0))}
      </div>
    </div>
  );
}

function CountUp({ to }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      if (reduce) return setN(to);
      const start = performance.now();
      const tick = (now) => {
        const u = Math.min(1, (now - start) / 1200);
        setN(Math.round(to * (1 - Math.pow(1 - u, 3))));
        if (u < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return <span ref={ref}>{n}</span>;
}

function About() {
  const { t } = useLang();
  const about = t.about;
  return (
    <section id="sobre" className="section">
      <div className="wrap">
        <SectionTitle index={1}>{about.title}</SectionTitle>
        <div className="about-grid">
          <Reveal className="about-text">
            {about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <ul className="stats">
              {/* 3 = cursos em andamento (Santander, Coding Branding Selling e ICBEU). Atualize se mudar. */}
              {[
                [t.projects.items.length, about.statProjects],
                [3, about.statCourses],
              ].map(([value, label]) => (
                <li key={label}>
                  <strong><CountUp to={value} /></strong>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={150}>
            <dl className="facts">
              {about.facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Journey() {
  const { t } = useLang();
  const tlRef = useRef(null);
  const [lit, setLit] = useState(0);

  // A linha amarela é desenhada conforme você rola; cada marco acende quando a linha chega nele.
  useEffect(() => {
    const el = tlRef.current;
    if (!el) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const trigger = window.innerHeight * 0.62;
      const p = Math.min(1, Math.max(0, (trigger - r.top) / r.height));
      el.style.setProperty('--p', p.toFixed(4));
      let n = 0;
      el.querySelectorAll('.tl-item').forEach((item, i) => {
        if (item.getBoundingClientRect().top + 22 < trigger) n = i + 1;
      });
      setLit(n);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="trajetoria" className="section">
      <div className="wrap">
        <SectionTitle index={2}>{t.journey.title}</SectionTitle>
        <ol ref={tlRef} className="timeline">
          {t.journey.items.map((it, i) => (
            <Reveal as="li" key={it.title} delay={i * 80} className={`tl-item ${i < lit ? 'lit' : ''}`}>
              <p className="tl-when">{it.period}</p>
              <span className="tl-icon">
                <Icon icon={it.kind === 'formacao' ? Mortarboard01Icon : Briefcase01Icon} size={20} />
              </span>
              <div>
                <h3>{it.title}</h3>
                <p className="tl-place">{it.place}</p>
                <p className="tl-period">{it.period}</p>
                {it.text && <p className="tl-text">{it.text}</p>}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

const pad = (n) => String(n + 1).padStart(2, '0');

const initialsOf = (name) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

/**
 * Capa da pasta: mostra a primeira captura do projeto (ou um placeholder quando
 * ainda não há fotos) e deixa navegar entre as imagens sem sair do card.
 */
function FolderCover({ images = [], title, labels, onOpen, self }) {
  const [index, setIndex] = useState(0);
  const total = images.length;

  if (self) {
    return (
      <div className="folder-cover folder-cover--self">
        <span className="folder-cover-live">
          <i aria-hidden="true" />
          {labels.self}
        </span>
        <small>{labels.selfNote}</small>
      </div>
    );
  }

  if (!total) {
    return (
      <div className="folder-cover folder-cover--empty" aria-hidden="true">
        <span className="folder-cover-mono">{initialsOf(title)}</span>
        <small>{labels.empty}</small>
      </div>
    );
  }

  const current = index % total;
  const shot = images[current];
  const src = getProjectImg(shot.img);
  const move = (step) => setIndex((value) => (value + step + total) % total);

  return (
    <div className="folder-cover">
      {src ? (
        <>
          <img className="folder-cover-blur" src={src} alt="" aria-hidden="true" draggable={false} />
          <img className="folder-cover-shot" src={src} alt={shot.label} draggable={false} />
        </>
      ) : (
        <span className="folder-cover-mono">{initialsOf(title)}</span>
      )}

      <button
        type="button"
        className="folder-cover-open"
        onClick={() => onOpen(current)}
        aria-label={`${labels.open}: ${shot.label}`}
      >
        <Icon icon={Image01Icon} size={15} />
        <span>{labels.open}</span>
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            className="folder-cover-nav folder-cover-nav--prev"
            onClick={() => move(-1)}
            aria-label={labels.prev}
          >
            <Icon icon={ArrowLeft01Icon} size={16} />
          </button>
          <button
            type="button"
            className="folder-cover-nav folder-cover-nav--next"
            onClick={() => move(1)}
            aria-label={labels.next}
          >
            <Icon icon={ArrowRight01Icon} size={16} />
          </button>
          <span className="folder-cover-count">
            {current + 1}/{total}
          </span>
          <span className="folder-cover-dots" aria-hidden="true">
            {images.map((image, dot) => (
              <i key={image.img} className={dot === current ? 'on' : ''} />
            ))}
          </span>
        </>
      )}
    </div>
  );
}

/** Galeria em tela cheia, com teclado, swipe e miniaturas. */
function Gallery({ images, start = 0, title, onClose }) {
  const { t } = useLang();
  const [index, setIndex] = useState(start);
  const total = images.length;
  const shot = images[index];
  const closeRef = useRef(null);
  const swipeX = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;

  const go = (step) => setIndex((value) => (value + step + total) % total);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close.current();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setIndex((value) => (value + 1) % total);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setIndex((value) => (value - 1 + total) % total);
      }
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [total]);

  return (
    <div className="gallery-overlay" onClick={onClose}>
      <div
        className="gallery-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${t.ui.galleryKicker} — ${title}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="gallery-header">
          <div>
            <p className="gallery-kicker">{t.ui.galleryKicker}</p>
            <h3>{title}</h3>
          </div>
          <button ref={closeRef} type="button" className="gallery-close" onClick={onClose} aria-label={t.ui.galleryClose}>
            <Icon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        <div
          className="gallery-main"
          onTouchStart={(event) => {
            swipeX.current = event.touches[0].clientX;
          }}
          onTouchEnd={(event) => {
            if (swipeX.current === null) return;
            const delta = event.changedTouches[0].clientX - swipeX.current;
            swipeX.current = null;
            if (Math.abs(delta) > 45) go(delta < 0 ? 1 : -1);
          }}
        >
          {total > 1 && (
            <button type="button" className="gallery-arrow gallery-arrow-left" onClick={() => go(-1)} aria-label={t.ui.galleryPrev}>
              <Icon icon={ArrowLeft01Icon} size={22} />
            </button>
          )}
          <img key={shot.img} className="gallery-img" src={getProjectImg(shot.img)} alt={shot.label} />
          {total > 1 && (
            <button type="button" className="gallery-arrow gallery-arrow-right" onClick={() => go(1)} aria-label={t.ui.galleryNext}>
              <Icon icon={ArrowRight01Icon} size={22} />
            </button>
          )}
        </div>

        <div className="gallery-bar">
          <span className="gallery-caption">{shot.label}</span>
          <span className="gallery-counter">
            {index + 1} / {total}
          </span>
        </div>

        {total > 1 && (
          <div className="gallery-thumbs">
            {images.map((item, thumb) => (
              <button
                key={item.img}
                type="button"
                className={`gallery-thumb${thumb === index ? ' active' : ''}`}
                onClick={() => setIndex(thumb)}
                aria-label={item.label}
                aria-current={thumb === index ? 'true' : undefined}
              >
                <img src={getProjectImg(item.img)} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


function Projects() {
  const { t } = useLang();
  const projects = t.projects.items;
  const swap = useRef(null);
  const [front, setFront] = useState(0);
  const [gallery, setGallery] = useState(null); // { images, index, title }
  const narrow = useNarrow(860);

  return (
    <section id="projetos" className="section">
      <div className="wrap">
        <SectionTitle index={3}>{t.projects.title}</SectionTitle>
        <div className="projects-layout">
          <Reveal className="projects-side">
            <p className="projects-lead">
              {t.projects.lead}
            </p>
            <div className="projects-ctrl">
              <button onClick={() => swap.current?.prev()} aria-label={t.ui.prevFolder}>
                <Icon icon={ArrowLeft01Icon} size={20} />
              </button>
              <span className="projects-count" aria-live="polite">
                {pad(front)} / {pad(projects.length - 1)}
              </span>
              <button onClick={() => swap.current?.next()} aria-label={t.ui.nextFolder}>
                <Icon icon={ArrowRight01Icon} size={20} />
              </button>
            </div>
          </Reveal>
          <div className="projects-stage">
            <CardSwap
              ref={swap}
              className="projects-swap"
              ariaLabel={t.ui.stackLabel}
              width={narrow ? 280 : 500}
              height={narrow ? 380 : 400}
              cardDistance={narrow ? 14 : 34}
              verticalDistance={narrow ? 30 : 46}
              depth={narrow ? 50 : 70}
              skewAmount={narrow ? 2 : 4}
              cardRadius={16}
              delay={5500}
              dim={0.55}
              bounce={0.3}
              onChange={setFront}
            >
              {projects.map((p, i) => {
                const images = p.gallery ?? [];
                return (
                  <Card key={p.tab} customClass={`folder-card folder-${i % 4}`}>
                    <div className="folder">
                      <div className="folder-tab">
                        <span className="folder-no">{pad(i)}</span>
                        <span className="folder-name">{p.tab}</span>
                      </div>
                      <FolderCover
                        images={images}
                        title={p.tab}
                        self={Boolean(p.self)}
                        labels={{
                          open: t.ui.gallery,
                          empty: t.ui.gallerySoon,
                          prev: t.ui.galleryPrev,
                          next: t.ui.galleryNext,
                          self: t.ui.gallerySelf,
                          selfNote: t.ui.gallerySelfNote,
                        }}
                        onOpen={(index) => setGallery({ images, index, title: p.title })}
                      />
                      <div className="folder-body">
                        <div className="folder-top">
                          <h3>{p.title}</h3>
                          <span className="status">{p.status}</span>
                        </div>
                        <p>{p.text}</p>
                        {p.href && (
                          <a className="folder-link" href={p.href} target="_blank" rel="noreferrer">
                            {t.projects.linkLabel}
                            <Icon icon={ArrowUpRight01Icon} size={16} />
                          </a>
                        )}
                        <ul className="tags">
                          {p.tags.map((tag) => (
                            <li key={tag}>{tag}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </CardSwap>
          </div>
        </div>

        {gallery && (
          <Gallery
            images={gallery.images}
            start={gallery.index}
            title={gallery.title}
            onClose={() => setGallery(null)}
          />
        )}
      </div>
    </section>
  );
}

// Número "aleatório" fixo a partir do índice (para o chip sempre vir do mesmo lugar)
const scatter = (i, salt) => {
  const v = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

function Skills() {
  const { t } = useLang();
  const [ref, shown] = useInView(0.2);
  let n = 0;
  return (
    <section id="habilidades" className="section">
      <div className="wrap">
        <SectionTitle index={4}>{t.skills.title}</SectionTitle>
        <div ref={ref} className={`skills ${shown ? 'is-in' : ''}`}>
          {t.skills.groups.map((s) => (
            <div key={s.group} className="skill-group">
              <h3>{s.group}</h3>
              <ul className="chips">
                {s.items.map((it) => {
                  const i = n++;
                  return (
                    <li
                      key={it}
                      style={{
                        '--dx': `${Math.round((scatter(i, 1) - 0.5) * 220)}px`,
                        '--dy': `${Math.round((scatter(i, 2) - 0.5) * 160)}px`,
                        '--r': `${Math.round((scatter(i, 3) - 0.5) * 40)}deg`,
                        transitionDelay: `${i * 90}ms`,
                      }}
                    >
                      {it}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <>
      <NetworkBackground />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Journey />
        <Projects />
        <Skills />
        <ContactArea photoUrl={photoUrl} cvUrl={cvUrl} />
      </main>
      <footer className="footer">
        <div className="wrap">© {new Date().getFullYear()} {base.name}</div>
      </footer>
    </>
  );
}
