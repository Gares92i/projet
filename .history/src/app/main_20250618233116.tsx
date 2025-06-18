import React from 'react';
import ReactDOM from 'react-dom/client';
import App from "./App";
import "../styles/index.css"; // Chemin corrigé
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
