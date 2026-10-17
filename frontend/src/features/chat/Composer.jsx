import { useEffect, useRef, useState } from 'react';

const MAX_HEIGHT = 168;

export default function Composer({ onSend, disabled, placeholder = 'Describe who you need' }) {
  const [text, setText] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [text]);

  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled]);

  const submit = (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value || disabled) return;
    onSend(value);
    setText('');
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) submit(event);
  };

  return (
    <form className="composer" onSubmit={submit}>
      <textarea ref={ref} rows={1} value={text} maxLength={500} placeholder={placeholder}
                aria-label="Message Open Seat"
                onChange={(e) => setText(e.target.value)} onKeyDown={onKeyDown} />
      <button type="submit" className="button" disabled={!text.trim() || disabled}>Send</button>
    </form>
  );
}