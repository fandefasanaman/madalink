import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FirebaseAuthService } from './services/firebaseAuth';

// Exposer la fonction promoteToAdmin pour la console
(window as any).promoteToAdmin = FirebaseAuthService.promoteToAdmin;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
