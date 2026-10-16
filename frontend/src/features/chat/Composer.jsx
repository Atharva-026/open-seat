import { useState } from 'react';

export default function Composer({ onSend, disabled, initialText = '' }) {
  const [text, setText] = useState(initialText);

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
      <textarea rows={2} value={text} maxLength={500} placeholder="Describe who you need"
                aria-label="Message Open Seat"
                onChange={(e) => setText(e.target.value)} onKeyDown={onKeyDown} />
      <button type="submit" className="button" disabled={!text.trim() || disabled}>Send</button>
    </form>
  );
}