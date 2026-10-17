import { filledCount } from './teamBuilder.js';

export default function SizeChoices({ builder, onChoose }) {
  const min = Math.max(2, filledCount(builder));

  return (
    <div className="chips size-choices">
      {[2, 3, 4].filter((n) => n >= min).map((n) => (
        <button key={n} type="button" className="chip" onClick={() => onChoose(n)}>{n} people</button>
      ))}
    </div>
  );
}