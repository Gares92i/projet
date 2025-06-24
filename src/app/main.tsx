import React from 'react';
import ReactDOM from 'react-dom/client';
import App from "./App";
import "../styles/index.css"; // Chemin corrigé
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/contexts/AuthContext';
import { ClerkProvider } from '@clerk/clerk-react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>,
)
