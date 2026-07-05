import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { installDesktopBridge } from "./desktopBridge";
import { appLogger } from "./lib/appLogger";

installDesktopBridge();
appLogger.info("sales-workspace renderer started");

const container = document.getElementById("root");
if (!container) {
  throw new Error("root element not found");
}

createRoot(container).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
