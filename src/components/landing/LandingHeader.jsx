import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "../common/Logo";
import ThemeToggle from "../common/ThemeToggle";

const LINKS = [["#fitur", "Sumber"], ["#cara-kerja", "Cara kerja"], ["#faq", "Pertanyaan"]];

export default function LandingHeader() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="lp-header">
      <div className="container lp-header__bar">
        <Logo />
        <nav aria-label="Utama" id="lp-nav" className={`lp-nav${open ? " is-open" : ""}`}>
          <ul>
            {LINKS.map(([href, label]) => (
              <li key={href}><a href={href} className="lp-nav__link" onClick={() => setOpen(false)}>{label}</a></li>
            ))}
          </ul>
        </nav>
        <div className="lp-header__actions">
          <ThemeToggle />
          <a href="#/app" className="btn btn--primary btn--sm lp-header__cta">Buka aplikasi</a>
          <button type="button" className="icon-btn lp-menu-btn" aria-expanded={open} aria-controls="lp-nav" aria-label={open ? "Tutup menu" : "Buka menu"} onClick={() => setOpen((v) => !v)}>
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
