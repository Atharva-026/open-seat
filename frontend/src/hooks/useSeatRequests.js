import { useCallback, useEffect, useState } from 'react';
import { fetchSeatRequests, respondToSeatRequest } from '../api/board.api.js';

const POLL_MS = 15000;

export function useSeatRequests(onChanged) {
  const [requests, setRequests] = useState([]);

  const refresh = useCallback(
    () => fetchSeatRequests().then(setRequests).catch(() => setRequests([])),
    []
  );

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const respond = useCallback(async (id, accept) => {
    await respondToSeatRequest(id, accept);
    await refresh();
    onChanged?.();
  }, [refresh, onChanged]);

  return { requests, respond };
}