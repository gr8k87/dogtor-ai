
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { HistoryProvider } from "./state/historyContext";

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HistoryProvider persist={false}>
      <App />
    </HistoryProvider>
  </React.StrictMode>
);

// Unregister existing service workers to prevent caching issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
      console.log('Unregistered existing service worker:', registration);
    });
  });
  
  // Clear all caches to prevent blank screen from cached assets
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
        console.log('Cleared cache:', name);
      });
    });
  }
}
