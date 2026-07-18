import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { FeedbackProvider } from './context/FeedbackContext';
import AppRouter from './routes/AppRouter';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FeedbackProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </FeedbackProvider>
  </StrictMode>
);
