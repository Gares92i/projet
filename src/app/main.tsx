import React from 'react';
import ReactDOM from 'react-dom/client';
import App from "./App";
import "../styles/index.css"; // Chemin corrigé
import { BrowserRouter } from 'react-router-dom';
import { ClerkAuthProvider } from '@/features/auth/contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkAuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkAuthProvider>
  </React.StrictMode>,
)
