import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export default function ThemeToggle() {
  const [theme, toggle] = useTheme();
  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label={`Ganti ke tema ${theme === "dark" ? "terang" : "gelap"}`}>
      {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
