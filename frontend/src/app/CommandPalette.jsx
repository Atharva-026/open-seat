import { useEffect, useMemo, useRef, useState } from 'react';

export default function CommandPalette({ open, onClose, actions }) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? actions.filter((action) => action.label.toLowerCase().includes(q)) : actions;
  }, [actions, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setIndex(0);
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => { setIndex(0); }, [query]);

  if (!open) return null;

  const run = (action) => {
    onClose();
    action.run();
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') onClose();
    else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter' && results[index]) {
      event.preventDefault();
      run(results[index]);
    }
  };

  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Command menu"
           onMouseDown={(e) => e.stopPropagation()} onKeyDown={onKeyDown}>
        <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
               placeholder="Type a command or search" aria-label="Command" />
        <ul role="listbox">
          {results.map((action, i) => (
            <li key={action.id} role="option" aria-selected={i === index}>
              <button type="button" className={i === index ? 'on' : ''}
                      onMouseEnter={() => setIndex(i)} onClick={() => run(action)}>
                {action.label}
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="none">No matches</li>}
        </ul>
      </div>
    </div>
  );
}