import Logo from '../../components/Logo.jsx';
import { API_URL } from '../../config.js';

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="strip">
        <span>Open Seat · teammate finder</span>
        <span className="party" aria-label="Party of four, one seat open">
          <i className="seat seat-sm seat-filled" />
          <i className="seat seat-sm seat-filled" />
          <i className="seat seat-sm seat-filled" />
          <i className="seat seat-sm" />
          party 3/4 · 1 seat open
        </span>
        <span>Graph Hacks 2026 · FalkorDB</span>
      </div>
      <div className="nav-row">
        <Logo />
        <nav aria-label="Page sections">
          <a href="#how">How it works</a>
          <a href="#why">Why a graph</a>
          <a href="#start">Your data</a>
        </nav>
        <a className="pill pill-sm" href={`${API_URL}/auth/github`}>Sign in</a>
      </div>
    </header>
  );
}