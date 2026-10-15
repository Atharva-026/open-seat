import {
  SKILLS, ARCHETYPES, REPO_NAMES, FIRST_NAMES, TIMEZONES, AVAILABILITY, NOTES,
} from './archetypes.js';

// Small seeded random generator so every run produces the same community.
function createRandom(seed) {
  let a = seed;
  const next = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    pick: (list) => list[Math.floor(next() * list.length)],
    shuffle: (list) => {
      const copy = [...list];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
  };
}

function buildPeople(rand, count) {
  return Array.from({ length: count }, (_, i) => {
    const archetype = ARCHETYPES[i % ARCHETYPES.length];
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const githubLogin = `demo-${first.toLowerCase()}-${i + 1}`;

    const addSkill = (name, level) => ({
      name,
      category: SKILLS[name],
      level,
      evidence: rand.shuffle(REPO_NAMES).slice(0, Math.max(1, level - 1)),
    });

    const core = archetype.core.map((name) => addSkill(name, rand.int(3, 5)));
    const extra = rand.shuffle(archetype.extra).slice(0, rand.int(2, 3)).map((name) => addSkill(name, rand.int(1, 3)));

    return {
      githubLogin,
      name: first,
      archetype: archetype.key,
      timezone: rand.pick(TIMEZONES),
      availability: rand.pick(AVAILABILITY),
      skills: [...core, ...extra],
    };
  });
}

const HACKATHONS = [
  { id: 'demo-hack-spring', name: 'Demo Spring Jam' },
  { id: 'demo-hack-summer', name: 'Demo Summer Build' },
  { id: 'demo-hack-autumn', name: 'Demo Autumn Sprint' },
];

function buildHistory(rand, people) {
  const teams = [];
  const pairs = [];

  HACKATHONS.forEach((hackathon) => {
    const order = rand.shuffle(people);
    for (let i = 0; i + 2 < order.length; i += 3) {
      const members = order.slice(i, i + 3);
      teams.push({
        id: `${hackathon.id}-team-${i / 3 + 1}`,
        name: `Team ${i / 3 + 1}`,
        hackathonId: hackathon.id,
        hackathonName: hackathon.name,
        outcome: rand.pick(['finalist', 'shipped', 'shipped', 'participated']),
        members: members.map((m) => m.githubLogin),
      });
      for (let a = 0; a < members.length; a++) {
        for (let b = a + 1; b < members.length; b++) {
          pairs.push({
            a: members[a].githubLogin,
            b: members[b].githubLogin,
            hackathonId: hackathon.id,
            rating: rand.pick([5, 5, 4, 4, 4, 3, 2]),
            note: rand.pick(NOTES),
          });
        }
      }
    }
  });

  return { teams, pairs };
}

export function generateCommunity({ count = 40, seed = 2026 } = {}) {
  const rand = createRandom(seed);
  const people = buildPeople(rand, count);
  return { people, ...buildHistory(rand, people) };
}