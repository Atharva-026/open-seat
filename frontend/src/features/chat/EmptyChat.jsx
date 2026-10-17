import { EXAMPLE_PROMPTS } from './prompts.js';

export default function EmptyChat({ name, onPick, onBuild }) {
  const first = name.split(' ')[0];

  return (
    <div className="empty-chat">
      <h1>Who is your team missing, {first}?</h1>
      <p className="muted">
        Tell me what you are building and who you already have. I search a graph of skills and past
        teams, and I show you how I found each person.
      </p>
      <div className="chips">
        <button type="button" className="chip chip-on" onClick={onBuild}>Build a team of 2 to 4</button>
      </div>
      <ul className="prompts">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <li key={prompt}>
            <button type="button" onClick={() => onPick(prompt)}>{prompt}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}