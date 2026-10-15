import { useCallback, useEffect, useState } from 'react';
import { fetchMe, logout } from '../api/profile.api.js';

// status: 'loading' | 'signedOut' | 'ready' | 'error'
export function useProfile() {
  const [state, setState] = useState({ status: 'loading', profile: null });

  useEffect(() => {
    fetchMe()
      .then((profile) => setState({ status: 'ready', profile }))
      .catch((err) =>
        setState({ status: err.status === 401 ? 'signedOut' : 'error', profile: null })
      );
  }, []);

  const signOut = useCallback(async () => {
    await logout();
    setState({ status: 'signedOut', profile: null });
  }, []);

  return { ...state, signOut };
}