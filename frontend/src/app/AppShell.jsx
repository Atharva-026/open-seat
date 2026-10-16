import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { useTeams } from '../hooks/useTeams.js';
import { useInbox } from '../hooks/useInbox.js';
import { useProposal } from '../hooks/useProposal.js';
import { useChat } from '../features/chat/useChat.js';
import Logo from '../components/Logo.jsx';

function NavItem({ to, label, badge = 0 }) {
  return (
    <NavLink to={to}>
      <svg className="nav-seat" viewBox="0 0 20 20" aria-hidden="true">
        <rect x="2" y="2" width="16" height="16" rx="5" />
      </svg>
      <span>{label}</span>
      {badge > 0 && <span className="nav-badge" aria-label={`${badge} pending`}>{badge}</span>}
    </NavLink>
  );
}

export default function AppShell() {
  const { profile, signOut } = useAuth();
  const { teams, refresh: refreshTeams } = useTeams();
  const { invites, respond } = useInbox(refreshTeams);
  const proposal = useProposal(refreshTeams);
  const chat = useChat();

  // Shared by all pages through the router outlet.
  const shared = { profile, chat, proposal, teams, invites, respondToInvite: respond };

  return (
    <div className="shell">
      <aside className="rail">
        <Logo />
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
    </div>
  );
}