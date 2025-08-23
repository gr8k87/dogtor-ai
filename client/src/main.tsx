
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { HistoryProvider } from "./state/historyContext";

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HistoryProvider persist={true}>
      <App />
    </HistoryProvider>
  </React.StrictMode>
);
