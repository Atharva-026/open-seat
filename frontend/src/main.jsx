import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './app/AuthContext.jsx';
import { router } from './app/router.jsx';
import './styles/tokens.css';
import './styles/base.css';
import './styles/logo.css';
import './styles/shell.css';
import './styles/chat.css';
import './styles/panels.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);