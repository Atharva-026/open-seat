import { useProfile } from './hooks/useProfile.js';
import Logo from './components/Logo.jsx';
import SignInCard from './components/SignInCard.jsx';
import SkillGraph from './components/SkillGraph.jsx';
import SkillList from './components/SkillList.jsx';

export default function App() {
  const { status, profile, signOut } = useProfile();

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
          <div className="dashboard">
            <section className="card"><SkillGraph profile={profile} /></section>
            <section className="card"><SkillList skills={profile.skills} /></section>
          </div>
        )}
      </main>
    </div>
  );
}