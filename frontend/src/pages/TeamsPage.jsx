import { useNavigate, useOutletContext } from 'react-router-dom';
import { useSkills } from '../hooks/useSkills.js';
import InboxPanel from '../features/teams/InboxPanel.jsx';
import SeatRequestsPanel from '../features/teams/SeatRequestsPanel.jsx';
import TeamsPanel from '../features/teams/TeamsPanel.jsx';

export default function TeamsPage() {
  const {
    profile, teams, invites, respondToInvite, incoming, respondToSeatRequest, refreshTeams,
  } = useOutletContext();
  const navigate = useNavigate();
  const skills = useSkills();

  const fillSeats = (team) => navigate('/app/find', { state: { fill: team } });

  return (
    <div className="page">
      <header className="page-head"><h1>Teams</h1></header>
      <InboxPanel invites={invites} onRespond={respondToInvite} />
      <SeatRequestsPanel requests={incoming} onRespond={respondToSeatRequest} />
      <TeamsPanel teams={teams} me={profile.githubLogin} skills={skills}
                  onFill={fillSeats} onSeatsChanged={refreshTeams} />
      {!teams.length && !invites.length && (
        <p className="muted">No teams yet. Open Find teammates and build one.</p>
      )}
    </div>
  );
}