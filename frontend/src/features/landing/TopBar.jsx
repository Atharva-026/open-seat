import Logo from '../../components/Logo.jsx';
import CtaButton from './CtaButton.jsx';

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
        <span>Built on FalkorDB</span>
      </div>
      <div className="nav-row">
        <Logo size={46} loop />
        <nav aria-label="Page sections">
          <a href="#how">How it works</a>
          <a href="#why">Why a graph</a>
          <a href="#start">Your data</a>
        </nav>
        <CtaButton className="pill pill-sm" signedInLabel="Open app" signedOutLabel="Sign in" />
      </div>
    </header>
  );
}