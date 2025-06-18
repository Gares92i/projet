import React from 'react'
import ReactDOM from 'react-dom/client'
import App from "./App";
import "../styles/index.css"; // Chemin corrigé
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@features/auth/contexts/AuthContext'
import { ThemeProvider } from "next-themes"


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
