import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { API_URL } from '../../config.js';

// One button for every call to action: sign in, or jump into the app when already signed in.
export default function CtaButton({
  className = 'pill',
  signedInLabel = 'Open the app',
  signedOutLabel = 'Sign in with GitHub',
}) {
  const { status } = useAuth();

  if (status === 'ready') {
    return <Link className={className} to="/app/find">{signedInLabel}</Link>;
  }
  return <a className={className} href={`${API_URL}/auth/github`}>{signedOutLabel}</a>;
}