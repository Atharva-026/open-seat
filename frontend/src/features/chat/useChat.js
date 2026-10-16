import { useCallback, useState } from 'react';
import { askMatcher } from '../../api/agent.api.js';

const HISTORY_SENT = 10;
const newId = () => crypto.randomUUID();

// Message: { id, role: 'user' | 'assistant', text, steps?, candidates?, failed? }
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);

  const send = useCallback(async (text) => {
    const history = messages
      .filter((m) => !m.failed)
      .slice(-HISTORY_SENT)
      .map((m) => ({ role: m.role, content: m.text }));

    setMessages((cur) => [...cur, { id: newId(), role: 'user', text }]);
    setPending(true);
    try {
      const result = await askMatcher(text, history);
      setMessages((cur) => [
        ...cur,
        { id: newId(), role: 'assistant', text: result.answer, steps: result.steps, candidates: result.candidates },
      ]);
    } catch (err) {
      const busy = err.status === 429;
      setMessages((cur) => [
        ...cur,
        {
          id: newId(),
          role: 'assistant',
          failed: true,
          text: busy
            ? 'The AI service is busy. Send your message again in a moment.'
            : 'Something went wrong on my side. Send your message again.',
        },
      ]);
    } finally {
      setPending(false);
    }
  }, [messages]);

  return { messages, pending, send };
}