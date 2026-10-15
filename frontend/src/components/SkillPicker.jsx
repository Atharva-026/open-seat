export default function SkillPicker({ skills, selected, onToggle }) {
  const byCategory = skills.reduce((groups, skill) => {
    (groups[skill.category] ??= []).push(skill.name);
    return groups;
  }, {});

  return (
    <div className="picker">
      {Object.entries(byCategory).map(([category, names]) => (
        <div key={category} className="picker-group">
          <h4>{category}</h4>
          <div className="chips">
            {names.map((name) => (
              <button
                key={name}
                type="button"
                className={`chip ${selected.includes(name) ? 'chip-on' : ''}`}
                aria-pressed={selected.includes(name)}
                onClick={() => onToggle(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}