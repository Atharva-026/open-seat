import { useState } from 'react';
import { useProfile } from './hooks/useProfile.js';
import { useTeams } from './hooks/useTeams.js';
import Logo from './components/Logo.jsx';
import SignInCard from './components/SignInCard.jsx';
import SkillGraph from './components/SkillGraph.jsx';
import SkillList from './components/SkillList.jsx';
import MatchPanel from './components/MatchPanel.jsx';
import TeamsPanel from './components/TeamsPanel.jsx';

export default function App() {
  const { status, profile, signOut } = useProfile();
  const { teams, refresh } = useTeams();
  const [teammates, setTeammates] = useState('');

  return (
    <div className="shell">
      <header className="topbar">
        <Logo />
        {status === 'ready' && (
          <div className="user">
            <span>{profile.name}</span>
            <button className="link" onClick={signOut}>Sign out</button>
          </div>
        )}
      </header>

      <main>
        {status === 'loading' && <p className="muted">Loading…</p>}
        {status === 'error' && <p className="muted">Could not reach the server. Is the backend running?</p>}
        {status === 'signedOut' && <SignInCard />}
        {status === 'ready' && (
          <>
            <div className="dashboard">
              <section className="card"><SkillGraph profile={profile} /></section>
              <section className="card"><SkillList skills={profile.skills} /></section>
            </div>
            <MatchPanel teammates={teammates} onTeammatesChange={setTeammates} onTeamFormed={refresh} />
            <TeamsPanel teams={teams} me={profile.githubLogin}
                        onUseTeam={(logins) => setTeammates(logins.join(', '))} />
          </>
        )}
      </main>
    </div>
  );
}