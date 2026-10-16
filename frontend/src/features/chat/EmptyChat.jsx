const PROMPTS = [
  'I need a designer and someone who knows computer vision',
  'I have a React developer. We need a backend person and someone to pitch',
  'Who from my past teams should I work with again?',
];

export default function EmptyChat({ name, onPick }) {
  const first = name.split(' ')[0];

  return (
    <div className="empty-chat">
      <h1>Who is your team missing, {first}?</h1>
      <p className="muted">
        Tell me what you are building and who you already have. I search a graph of skills and past
        teams, and I show you how I found each person.
      </p>
      <ul className="prompts">
        {PROMPTS.map((prompt) => (
          <li key={prompt}>
            <button type="button" onClick={() => onPick(prompt)}>{prompt}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}