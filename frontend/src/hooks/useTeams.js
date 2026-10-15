import { useCallback, useEffect, useState } from 'react';
import { fetchTeams } from '../api/teams.api.js';

export function useTeams() {
  const [teams, setTeams] = useState([]);

  const refresh = useCallback(
    () => fetchTeams().then(setTeams).catch(() => setTeams([])),
    []
  );

  useEffect(() => { refresh(); }, [refresh]);

  return { teams, refresh };
}