import { useCallback, useEffect, useState } from 'react';
import { fetchBoard, requestSeat } from '../api/board.api.js';

export function useBoard() {
  const [board, setBoard] = useState({ seats: [], requests: [] });
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(
    () => fetchBoard().then(setBoard).catch(() => {}).finally(() => setLoaded(true)),
    []
  );
  useEffect(() => { refresh(); }, [refresh]);

  const ask = useCallback(async (seatId, message) => {
    await requestSeat(seatId, message);
    await refresh();
  }, [refresh]);

  return { ...board, loaded, ask };
}