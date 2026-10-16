export default function SeatMark({ working = false }) {
  return (
    <svg className={`seat-mark ${working ? 'seat-mark-working' : ''}`} viewBox="0 0 32 32"
         width="28" height="28" aria-hidden="true">
      <rect x="3" y="3" width="26" height="26" rx="8" />
    </svg>
  );
}