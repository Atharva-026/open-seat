import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { useTeams } from '../hooks/useTeams.js';
import { useInbox } from '../hooks/useInbox.js';
import { useProposal } from '../hooks/useProposal.js';
import { useChat } from '../features/chat/useChat.js';
import { EXAMPLE_PROMPTS } from '../features/chat/prompts.js';
import CommandPalette from './CommandPalette.jsx';
import Logo from '../components/Logo.jsx';

function NavItem({ to, label, badge = 0 }) {
  return (
    <NavLink to={to}>
      <svg className="nav-seat" viewBox="0 0 20 20" aria-hidden="true">
        <rect x="2" y="2" width="16" height="16" rx="4.5" />
        <circle cx="10" cy="10" r="2.6" />
      </svg>
      <span>{label}</span>
      {badge > 0 && <span className="nav-badge" aria-label={`${badge} pending`}>{badge}</span>}
    </NavLink>
  );
}

export default function AppShell() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { teams, refresh: refreshTeams } = useTeams();
  const { invites, respond } = useInbox(refreshTeams);
  const proposal = useProposal(refreshTeams);
  const chat = useChat();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const { reset, send } = chat;
  const actions = useMemo(() => [
    { id: 'find', label: 'Find teammates', run: () => navigate('/app/find') },
    { id: 'teams', label: 'Teams and invitations', run: () => navigate('/app/teams') },
    { id: 'me', label: 'My profile and memory', run: () => navigate('/app/me') },
    { id: 'new', label: 'Start a new chat', run: () => { reset(); navigate('/app/find'); } },
    { id: 'home', label: 'Go to the home page', run: () => navigate('/') },
    ...EXAMPLE_PROMPTS.map((prompt) => ({
      id: prompt,
      label: `Ask: ${prompt}`,
      run: () => { navigate('/app/find'); send(prompt); },
    })),
    { id: 'out', label: 'Sign out', run: signOut },
  ], [navigate, reset, send, signOut]);

  const shared = { profile, chat, proposal, teams, invites, respondToInvite: respond, openPalette };

  return (
    <div className="shell">
      <aside className="rail">
        <Link to="/" className="rail-home" aria-label="Back to the Open Seat home page">
          <Logo size={32} />
        </Link>
        <nav className="nav" aria-label="Main">
          <NavItem to="/app/find" label="Find teammates" />
          <NavItem to="/app/teams" label="Teams" badge={invites.length} />
          <NavItem to="/app/me" label="Me" />
        </nav>
        <div className="rail-user">
          <span>{profile.name}</span>
          <button type="button" className="link-btn" onClick={signOut}>Sign out</button>
        </div>
      </aside>
      <main className="stage">
        <Outlet context={shared} />
      </main>
      <CommandPalette open={paletteOpen} onClose={closePalette} actions={actions} />
    </div>
  );
}