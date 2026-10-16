import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export default function RequireAuth() {
  const { status } = useAuth();

  if (status === 'loading') return <p className="boot">Loading…</p>;
  if (status === 'error') return <p className="boot">Could not reach the server. Is the backend running?</p>;
  if (status === 'signedOut') return <Navigate to="/" replace />;
  return <Outlet />;
}