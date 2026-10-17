export default function Trace() {
  return (
    <section className="trace" id="why">
      <h2>Every suggestion comes with its path.</h2>

      <div className="trace-row">
        <div className="path" role="img"
             aria-label="You rated Pooja 5 out of 5, and Pooja rated Hana 4 out of 5">
          <span className="path-node path-you">You</span>
          <span className="path-edge"><i>5/5</i></span>
          <span className="path-node">Pooja</span>
          <span className="path-edge"><i>4/5</i></span>
          <span className="path-node path-target">Hana</span>
        </div>
        <p>
          Hana covers Product Pitching at level 5, but you have never worked with her. Pooja has,
          and you rated Pooja 5 out of 5, so the introduction goes through Pooja. Open Seat shows
          that chain next to every name it suggests. The people in this example are demo personas.
        </p>
      </div>

      <div className="trace-row">
        <h3>It remembers, privately.</h3>
        <p>
          Your preferences, your past requests and what worked for your teams live in a graph that
          only you can read. Change or erase it any time from your profile.
        </p>
      </div>
    </section>
  );
}