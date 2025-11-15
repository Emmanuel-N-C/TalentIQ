import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import './index.css';

// Suppress Google OAuth console warnings
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('CSI_LOGGER') || 
     args[0].includes('credential_button') ||
     args[0].includes('Provided button width is invalid'))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('Failed to load resource') ||
     args[0].includes('Cross-Origin-Opener-Policy'))
  ) {
    return;
  }
  originalError.apply(console, args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1e293b',
                  color: '#fff',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #334155',
                  maxWidth: '90vw',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
              containerStyle={{
                top: 20,
                left: 20,
                bottom: 20,
                right: 20,
              }}
            />
            <App />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);