import { Navigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext.jsx';
import { API_URL } from '../config.js';
import Logo from '../components/Logo.jsx';

export default function LandingPage() {
  const { status } = useAuth();
  if (status === 'ready') return <Navigate to="/app/find" replace />;

  return (
    <main className="landing">
      <Logo />
      <h1>Find the teammate who fills the gap.</h1>
      <p>
        Open Seat reads the projects you have built, finds people whose skills cover what your team
        is missing, and shows you exactly how it found them.
      </p>
      <a className="button" href={`${API_URL}/auth/github`}>Sign in with GitHub</a>
    </main>
  );
}