import { useCallback, useEffect, useState } from 'react';
import { fetchTeams } from '../api/teams.api.js';

const POLL_MS = 15000;

export function useTeams() {
  const [teams, setTeams] = useState([]);

  const refresh = useCallback(
    () => fetchTeams().then(setTeams).catch(() => setTeams([])),
    []
  );

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  return { teams, refresh };
}