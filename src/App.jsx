import { useEffect } from "react";
import { useHashRoute } from "./hooks/useHashRoute";
import Landing from "./pages/Landing";
import Workspace from "./pages/Workspace";

const TITLES = {
  home: "Rangkum.in — Ringkas artikel, dokumen, dan video",
  app: "Ringkas — Rangkum.in",
};

export default function App() {
  const route = useHashRoute();
  useEffect(() => { document.title = TITLES[route]; }, [route]);
  return route === "app" ? <Workspace /> : <Landing />;
}
