import { HistoryProvider } from "./state/historyContext";
//import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
createRoot(document.getElementById("root")!).render(
  <HistoryProvider persist={true}>
    <App />
  </HistoryProvider>,
);
