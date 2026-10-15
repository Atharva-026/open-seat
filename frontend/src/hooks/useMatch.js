import { useCallback, useState } from 'react';
import { findMatches } from '../api/match.api.js';

// status: 'idle' | 'loading' | 'done' | 'error'
export function useMatch() {
  const [state, setState] = useState({ status: 'idle', result: null });

  const run = useCallback(async (needed, teammates) => {
    setState({ status: 'loading', result: null });
    try {
      const result = await findMatches({ needed, teammates });
      setState({ status: 'done', result });
    } catch {
      setState({ status: 'error', result: null });
    }
  }, []);

  return { ...state, run };
}