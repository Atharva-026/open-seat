import { createContext, useContext } from 'react';
import { useProfile } from '../hooks/useProfile.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useProfile();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);