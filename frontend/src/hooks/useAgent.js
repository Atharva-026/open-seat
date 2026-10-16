import { useCallback, useState } from 'react';
import { askMatcher } from '../api/agent.api.js';

// status: 'idle' | 'loading' | 'done' | 'error'
export function useAgent() {
  const [state, setState] = useState({ status: 'idle', result: null, errorStatus: null });

  const ask = useCallback(async (message) => {
    setState({ status: 'loading', result: null, errorStatus: null });
    try {
      setState({ status: 'done', result: await askMatcher(message), errorStatus: null });
    } catch (err) {
      setState({ status: 'error', result: null, errorStatus: err.status ?? null });
    }
  }, []);

  return { ...state, ask };
}