import SeatStrip from './SeatStrip.jsx';

const STEPS = [
  {
    title: 'Sign in with GitHub',
    text: 'Open Seat reads your public repositories and turns them into skills, each one linked to the projects that prove it.',
    filled: 1,
  },
  {
    title: 'Ask for who you need',
    text: 'Describe the gap in plain English. The agent searches the graph, ranks people, and shows every step it took.',
    filled: 2,
  },
  {
    title: 'Invite, then rate',
    text: 'Send invitations, then rate your teammates after the event. Those ratings change who Open Seat suggests next time.',
    filled: 4,
  },
];

export default function HowItWorks() {
  return (
    <section className="how" id="how">
      <h2>How it works</h2>
      <ol className="steps-list">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <span className="step-no">{i + 1}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <SeatStrip filled={step.filled} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}