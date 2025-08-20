
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { HistoryProvider } from "./state/historyContext";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HistoryProvider persist={true}>
      <App />
    </HistoryProvider>
  </StrictMode>
);
