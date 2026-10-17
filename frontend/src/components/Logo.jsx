// loop: replay forever (landing page). Otherwise it plays once and rests.
export default function Logo({ size = 34, loop = false, withWord = true }) {
  return (
    <span className={`logo ${loop ? 'logo-loop' : 'logo-once'}`}>
      <svg className="logo-mark" viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
        <rect className="m-seat" x="10" y="10" width="44" height="44" rx="12" />
        <rect className="m-seat" x="66" y="10" width="44" height="44" rx="12" />
        <rect className="m-seat" x="10" y="66" width="44" height="44" rx="12" />
        <circle className="m-person" cx="32" cy="32" r="7" />
        <circle className="m-person" cx="88" cy="32" r="7" />
        <circle className="m-person" cx="32" cy="88" r="7" />
        <rect className="m-open" x="67.5" y="67.5" width="41" height="41" rx="11" />
        <rect className="m-fill" x="66" y="66" width="44" height="44" rx="12" />
        <circle className="m-dot" cx="88" cy="88" r="7" />
      </svg>
      {withWord && <span className="logo-word">open seat</span>}
    </span>
  );
}