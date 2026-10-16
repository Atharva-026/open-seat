import { useCallback, useEffect, useState } from 'react';
import { fetchInbox, respondToInvite } from '../api/teams.api.js';

const POLL_MS = 15000;

export function useInbox(onChanged) {
  const [invites, setInvites] = useState([]);

  const refresh = useCallback(
    () => fetchInbox().then(setInvites).catch(() => setInvites([])),
    []
  );

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const respond = useCallback(async (id, accept) => {
    await respondToInvite(id, accept);
    await refresh();
    onChanged?.();
  }, [refresh, onChanged]);

  return { invites, respond };
}