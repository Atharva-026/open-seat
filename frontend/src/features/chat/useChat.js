import { useCallback, useState } from 'react';
import { askMatcher } from '../../api/agent.api.js';

const HISTORY_SENT = 10;
const newId = () => crypto.randomUUID();

// Message: { id, role: 'user' | 'assistant', text, steps?, candidates?, failed? }
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);

  // `base` is the conversation before this question.
  const run = useCallback(async (text, base) => {
    const history = base
      .filter((m) => !m.failed)
      .slice(-HISTORY_SENT)
      .map((m) => ({ role: m.role, content: m.text }));

    setMessages([...base, { id: newId(), role: 'user', text }]);
    setPending(true);
    try {
      const result = await askMatcher(text, history);
      setMessages((cur) => [
        ...cur,
        { id: newId(), role: 'assistant', text: result.answer, steps: result.steps, candidates: result.candidates },
      ]);
    } catch (err) {
      setMessages((cur) => [
        ...cur,
        {
          id: newId(),
          role: 'assistant',
          failed: true,
          text: err.status === 429
            ? 'The AI service is busy right now.'
            : 'Something went wrong on my side.',
        },
      ]);
    } finally {
      setPending(false);
    }
  }, []);

  const send = useCallback((text) => run(text, messages), [run, messages]);

  const retry = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    run(lastUser.text, messages.slice(0, messages.lastIndexOf(lastUser)));
  }, [messages, run]);

  const reset = useCallback(() => setMessages([]), []);

  return { messages, pending, send, retry, reset };
}