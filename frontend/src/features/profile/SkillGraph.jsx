import { categoryColor } from '../../lib/categoryColors.js';

const SIZE = 640;
const CENTER = SIZE / 2;
const RING = 200;

function layout(skills) {
  const sorted = [...skills].sort(
    (a, b) => a.category.localeCompare(b.category) || b.level - a.level
  );
  return sorted.map((skill, i) => {
    const angle = (i / sorted.length) * 2 * Math.PI - Math.PI / 2;
    const radius = 8 + skill.level * 2.5;
    return {
      ...skill,
      radius,
      x: CENTER + RING * Math.cos(angle),
      y: CENTER + RING * Math.sin(angle),
      labelX: CENTER + (RING + radius + 10) * Math.cos(angle),
      labelY: CENTER + (RING + radius + 10) * Math.sin(angle),
      anchor: Math.abs(Math.cos(angle)) < 0.2 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end',
    };
  });
}

export default function SkillGraph({ profile }) {
  const nodes = layout(profile.skills);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="graph" role="img"
         aria-label={`Skill graph for ${profile.name}`}>
      {nodes.map((n) => (
        <line key={`edge-${n.name}`} x1={CENTER} y1={CENTER} x2={n.x} y2={n.y} className="edge" />
      ))}
      <clipPath id="avatar-clip"><circle cx={CENTER} cy={CENTER} r="34" /></clipPath>
      <circle cx={CENTER} cy={CENTER} r="38" className="person-ring" />
      <image href={profile.avatarUrl} x={CENTER - 34} y={CENTER - 34} width="68" height="68"
             clipPath="url(#avatar-clip)" />
      {nodes.map((n) => (
        <g key={n.name}>
          <title>{`${n.name} (level ${n.level}): ${n.evidence.join(', ')}`}</title>
          <circle cx={n.x} cy={n.y} r={n.radius} fill={categoryColor(n.category)} />
          <text x={n.labelX} y={n.labelY + 4} textAnchor={n.anchor} className="node-label">
            {n.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
