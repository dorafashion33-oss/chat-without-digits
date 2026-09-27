import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerBuzzServiceWorker } from "./lib/registerSW";

const root = document.getElementById("root");

if (!root) throw new Error("Buzz root element is missing");

createRoot(root).render(<App />);

registerBuzzServiceWorker();
