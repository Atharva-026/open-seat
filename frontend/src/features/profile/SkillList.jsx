import { categoryColor } from '../../lib/categoryColors.js';

export default function SkillList({ skills }) {
  const byCategory = skills.reduce((groups, skill) => {
    (groups[skill.category] ??= []).push(skill);
    return groups;
  }, {});

  return (
    <div className="skill-list">
      {Object.entries(byCategory).map(([category, items]) => (
        <section key={category}>
          <h3>
            <span className="swatch" style={{ background: categoryColor(category) }} />
            {category}
          </h3>
          <ul>
            {items.map((s) => (
              <li key={s.name}>
                <strong>{s.name}</strong>
                <span className="level">level {s.level}</span>
                <span className="evidence">{s.evidence.join(', ')}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
