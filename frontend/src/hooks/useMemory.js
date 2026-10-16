import { useCallback, useEffect, useState } from 'react';
import * as api from '../api/memory.api.js';

export function useMemory() {
  const [memory, setMemory] = useState({ preferences: [], episodes: [] });

  const refresh = useCallback(
    () => api.fetchMemory().then(setMemory).catch(() => {}),
    []
  );

  useEffect(() => { refresh(); }, [refresh]);

  const save = useCallback((key, value) => api.savePreference(key, value).then(refresh), [refresh]);
  const forget = useCallback((key) => api.forgetPreference(key).then(refresh), [refresh]);
  const forgetAll = useCallback(() => api.forgetEverything().then(refresh), [refresh]);

  return { memory, refresh, save, forget, forgetAll };
}