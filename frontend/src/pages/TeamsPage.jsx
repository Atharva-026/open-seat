import { useNavigate, useOutletContext } from 'react-router-dom';
import InboxPanel from '../features/teams/InboxPanel.jsx';
import TeamsPanel from '../features/teams/TeamsPanel.jsx';

export default function TeamsPage() {
  const { profile, teams, invites, respondToInvite } = useOutletContext();
  const navigate = useNavigate();

  const findMore = (logins) =>
    navigate('/app/find', { state: { draft: `My team so far: ${logins.join(', ')}. We still need ` } });

  return (
    <div className="page">
      <header className="page-head"><h1>Teams</h1></header>
      <InboxPanel invites={invites} onRespond={respondToInvite} />
      <TeamsPanel teams={teams} me={profile.githubLogin} onUseTeam={findMore} />
      {!teams.length && !invites.length && (
        <p className="muted">No teams yet. Ask for teammates in Find teammates, add people, and send invitations.</p>
      )}
    </div>
  );
}