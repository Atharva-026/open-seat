import { useCallback, useState } from 'react';
import { createTeam } from '../api/teams.api.js';

const MAX_ADDED = 3; // you plus three others makes a team of four

// status: 'idle' | 'sending' | 'sent' | 'error'
export function useProposal(onSent) {
  const [people, setPeople] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [status, setStatus] = useState('idle');

  const has = useCallback((login) => people.some((p) => p.githubLogin === login), [people]);

  const toggle = useCallback((candidate) => {
    setStatus('idle');
    setPeople((cur) => {
      if (cur.some((p) => p.githubLogin === candidate.githubLogin)) {
        return cur.filter((p) => p.githubLogin !== candidate.githubLogin);
      }
      return cur.length < MAX_ADDED ? [...cur, candidate] : cur;
    });
  }, []);

  const send = useCallback(async () => {
    setStatus('sending');
    try {
      await createTeam({ name: teamName, members: people.map((p) => p.githubLogin) });
      setPeople([]);
      setTeamName('');
      setStatus('sent');
      onSent?.();
    } catch {
      setStatus('error');
    }
  }, [people, teamName, onSent]);

  const dismiss = useCallback(() => setStatus('idle'), []);

  return { people, has, toggle, canAdd: people.length < MAX_ADDED, teamName, setTeamName, status, send, dismiss };
}