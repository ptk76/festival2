import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppProvider } from "./context/AppContext.tsx";

document.body.style.margin = "0px";
document.body.style.fontFamily = "system-ui";
document.body.style.userSelect = "none";

const url = new URL(location.href);
const sharedId = url.searchParams.get("share");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <App sharedId={sharedId ?? undefined} />
    </AppProvider>
  </StrictMode>,
);
