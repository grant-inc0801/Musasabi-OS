import { createRoot } from "react-dom/client";
import { App } from "./App";
import { installDesktopBridge } from "./desktopBridge";

installDesktopBridge();

const container = document.getElementById("root");
if (!container) {
  throw new Error("root element not found");
}

createRoot(container).render(<App />);
