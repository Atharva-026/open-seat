export default function Logo() {
  return (
    <div className="logo">
      <svg viewBox="0 0 120 120" width="30" height="30" aria-hidden="true">
        <rect x="12" y="12" width="44" height="44" rx="12" fill="var(--accent)" />
        <rect x="64" y="12" width="44" height="44" rx="12" fill="var(--accent)" opacity=".78" />
        <rect x="12" y="64" width="44" height="44" rx="12" fill="var(--accent)" opacity=".58" />
        <rect x="64" y="64" width="44" height="44" rx="12" fill="var(--accent)" />
        <circle cx="86" cy="86" r="8" fill="var(--ink)" />
      </svg>
      <span>open seat</span>
    </div>
  );
}