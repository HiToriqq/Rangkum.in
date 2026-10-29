export default function Logo({ href = "#/" }) {
  return (
    <a href={href} className="logo" aria-label="Rangkum.in, beranda">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill="var(--accent)" />
        <path d="M8 10h16M8 16h16M8 22h9" stroke="var(--on-accent)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span>rangkum<span className="logo__dot">.in</span></span>
    </a>
  );
}
