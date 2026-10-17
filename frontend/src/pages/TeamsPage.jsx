import { useNavigate, useOutletContext } from 'react-router-dom';
import InboxPanel from '../features/teams/InboxPanel.jsx';
import TeamsPanel from '../features/teams/TeamsPanel.jsx';

export default function TeamsPage() {
  const { profile, teams, invites, respondToInvite } = useOutletContext();
  const navigate = useNavigate();

  const fillSeats = (team) => navigate('/app/find', { state: { fill: team } });

  return (
    <div className="page">
      <header className="page-head"><h1>Teams</h1></header>
      <InboxPanel invites={invites} onRespond={respondToInvite} />
      <TeamsPanel teams={teams} me={profile.githubLogin} onFill={fillSeats} />
      {!teams.length && !invites.length && (
        <p className="muted">No teams yet. Open Find teammates and build one.</p>
      )}
    </div>
  );
}