import { useInView } from './Reveal.jsx';

// [esquerda, topo] de cada "partícula" que pisca em volta do título
const SPECKS = [
  ['-6%', '-0.5em', '4px', '2.1s', '0s'],
  ['42%', '-0.55em', '3px', '1.7s', '0.4s'],
  ['101%', '18%', '5px', '2.4s', '0.2s'],
  ['97%', '108%', '3px', '1.9s', '0.7s'],
  ['14%', '115%', '4px', '2.2s', '1s'],
  ['-5%', '62%', '3px', '1.6s', '0.5s'],
];

export default function SectionTitle({ index, total = 5, children }) {
  const [ref, shown] = useInView(0.5);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <h2 ref={ref} className={`title ${shown ? 'is-in' : ''}`}>
      <span className="title-idx" aria-hidden="true">{pad(index)} / {pad(total)}</span>
      <span className="title-text">{children}</span>
      <span className="title-frame" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="title-specks" aria-hidden="true">
        {SPECKS.map(([x, y, s, t, d]) => (
          <b key={x + y} style={{ '--x': x, '--y': y, '--s': s, '--t': t, '--d': d }} />
        ))}
      </span>
    </h2>
  );
}
