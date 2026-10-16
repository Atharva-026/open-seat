export default function AgentSteps({ steps }) {
  if (!steps.length) return null;

  return (
    <details className="steps">
      <summary>What the agent did ({steps.length} steps)</summary>
      <ol>
        {steps.map((step, i) => (
          <li key={`${step.tool}-${i}`}>
            <strong>{step.summary}</strong>
            <code>{step.tool}({Object.keys(step.input).length ? JSON.stringify(step.input) : ''})</code>
          </li>
        ))}
      </ol>
    </details>
  );
}