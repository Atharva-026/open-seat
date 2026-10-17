import { API_URL } from '../../config.js';

export default function Finale() {
  return (
    <section className="finale" id="start">
      <h2>Take a seat.</h2>
      <a className="pill" href={`${API_URL}/auth/github`}>Sign in with GitHub</a>
      <p className="data-note">
        Open Seat reads public repositories only. Demo personas are synthetic and always labelled.
        You can erase what it remembers about you from your profile.
      </p>
      <footer className="foot">
        <span>Built for Graph Hacks 2026 with FalkorDB</span>
        <a href="https://github.com/Atharva-026/open-seat">Source on GitHub</a>
      </footer>
    </section>
  );
}