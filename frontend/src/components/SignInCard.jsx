import { API_URL } from '../config.js';

export default function SignInCard() {
  return (
    <section className="card signin">
      <h1>Find the teammate who fills the gap.</h1>
      <p>
        Sign in with GitHub and Open Seat builds your skill graph from the projects you have
        actually built. Only your public repositories are read.
      </p>
      <a className="button" href={`${API_URL}/auth/github`}>Sign in with GitHub</a>
    </section>
  );
}