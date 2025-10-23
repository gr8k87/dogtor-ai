
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { HistoryProvider } from "./state/historyContext";
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC2jgI1PSJJbwNsTedQYXq9bZin21ir-C0",
  authDomain: "dogtor-2025.firebaseapp.com",
  projectId: "dogtor-2025",
  storageBucket: "dogtor-2025.firebasestorage.app",
  messagingSenderId: "136955019863",
  appId: "1:136955019863:web:76d43e3907dc2622df9912",
  measurementId: "G-Y0G1G4PTJR",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
