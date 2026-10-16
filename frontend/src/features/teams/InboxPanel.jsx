export default function InboxPanel({ invites, onRespond }) {
  if (!invites.length) return null;

  return (
    <section className="card match">
      <h2>Invitations for you</h2>
      {invites.map((invite) => (
        <article key={invite.id} className="candidate">
          <h3>{invite.teamName}</h3>
          <span className="muted">from {invite.fromName} (@{invite.fromLogin})</span>
          <p>{invite.message}</p>
          <div className="chips">
            <button type="button" className="chip chip-on" onClick={() => onRespond(invite.id, true)}>Accept</button>
            <button type="button" className="chip" onClick={() => onRespond(invite.id, false)}>Decline</button>
          </div>
        </article>
      ))}
    </section>
  );
}