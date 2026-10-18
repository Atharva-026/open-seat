import { useEffect, useState } from 'react';
import { fetchSkills } from '../api/board.api.js';

export function useSkills() {
  const [skills, setSkills] = useState([]);
  useEffect(() => {
    fetchSkills().then(setSkills).catch(() => setSkills([]));
  }, []);
  return skills;
}