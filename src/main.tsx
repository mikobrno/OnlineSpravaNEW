import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App.tsx';
import './index.css';
import { AppProvider } from '../contexts/AppContext.tsx';
import { ToastProvider } from '../contexts/ToastContext.tsx';
import { ThemeProvider } from '../contexts/ThemeContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
