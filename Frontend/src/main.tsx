import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDatabase } from "./lib/db.ts";

// Initialize database before rendering
initDatabase().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
}).catch((error) => {
  console.error('Failed to initialize database:', error);
  // Render app anyway, with error handling
  createRoot(document.getElementById("root")!).render(<App />);
});