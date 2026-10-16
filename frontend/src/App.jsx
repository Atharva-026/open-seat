import { useState } from 'react';
import { useProfile } from './hooks/useProfile.js';
import { useTeams } from './hooks/useTeams.js';
import { useInbox } from './hooks/useInbox.js';
import { useMemory } from './hooks/useMemory.js';
import Logo from './components/Logo.jsx';
import SignInCard from './components/SignInCard.jsx';
import SkillGraph from './components/SkillGraph.jsx';
import SkillList from './components/SkillList.jsx';
import AgentPanel from './components/AgentPanel.jsx';
import MatchPanel from './components/MatchPanel.jsx';
import TeamsPanel from './components/TeamsPanel.jsx';
import MemoryPanel from './components/MemoryPanel.jsx';
import InboxPanel from './components/InboxPanel.jsx';

export default function App() {
  const { status, profile, signOut } = useProfile();
  const { teams, refresh } = useTeams();
  const { invites, respond } = useInbox(refresh);
  const { memory, refresh: refreshMemory, save, forget, forgetAll } = useMemory();
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
            <InboxPanel invites={invites} onRespond={respond} />
            <div className="dashboard">
              <section className="card"><SkillGraph profile={profile} /></section>
              <section className="card"><SkillList skills={profile.skills} /></section>
            </div>
            <AgentPanel onDone={refreshMemory} />
            <MatchPanel teammates={teammates} onTeammatesChange={setTeammates} onTeamFormed={refresh} />
            <TeamsPanel teams={teams} me={profile.githubLogin}
                        onUseTeam={(logins) => setTeammates(logins.join(', '))} />
            <MemoryPanel memory={memory} onSave={save} onForget={forget} onForgetAll={forgetAll} />
          </>
        )}
      </main>
    </div>
  );
}