import { useEffect, useState } from 'react';
import { fetchSkills } from '../api/match.api.js';

export function useSkills() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetchSkills().then(setSkills).catch(() => setSkills([]));
  }, []);

  return skills;
}