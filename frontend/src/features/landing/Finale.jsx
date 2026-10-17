import CtaButton from './CtaButton.jsx';

export default function Finale() {
  return (
    <section className="finale" id="start">
      <h2>Take a seat.</h2>
      <CtaButton />
      <p className="data-note">
        Open Seat reads public repositories only. Demo personas are synthetic and always labelled.
        You can erase what it remembers about you from your profile.
      </p>
      <footer className="foot">
        <span>Built on FalkorDB</span>
        <a href="https://github.com/Atharva-026/open-seat">Source on GitHub</a>
      </footer>
    </section>
  );
}