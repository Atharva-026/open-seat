// seat.state: 'filled' | 'pending' | 'open'
export default function SeatRow({ seats }) {
  return (
    <ol className="seat-row" aria-label="Team seats">
      {seats.map((seat, i) => (
        <li key={`${seat.label}-${i}`} className={`seat-cell seat-cell-${seat.state}`}>
          <span className="seat-cell-box">{seat.state === 'open' ? '' : seat.label.slice(0, 1)}</span>
          <span className="seat-cell-name">{seat.you ? 'You' : seat.label}</span>
        </li>
      ))}
    </ol>
  );
}