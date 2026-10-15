import * as skillRepository from '../repositories/skill.repository.js';
import * as personRepository from '../repositories/person.repository.js';
import * as matchRepository from '../repositories/match.repository.js';

const WEIGHTS = { coverage: 0.6, strength: 0.3, trust: 0.1 };

export const listAvailableSkills = () => skillRepository.listSkills();

function rankCandidate(row, gap) {
  const { fills } = row;
  const coverage = fills.length / gap.length;
  const strength = fills.reduce((sum, f) => sum + f.level, 0) / fills.length / 5;
  const hasHistory = row.history !== null && row.history !== undefined;
  const trust = hasHistory ? (row.history - 1) / 4 : 0.5;
  const score = Math.round(
    (WEIGHTS.coverage * coverage + WEIGHTS.strength * strength + WEIGHTS.trust * trust) * 100
  );

  const strongest = [...fills].sort((a, b) => b.level - a.level)[0];
  const reasons = [
    `Covers ${fills.map((f) => f.name).join(', ')} (${fills.length} of ${gap.length} gaps)`,
    `Strongest in ${strongest.name} (level ${strongest.level}), seen in ${strongest.evidence.slice(0, 3).join(', ')}`,
  ];
  if (hasHistory) {
    reasons.push(
      `Teamed with your group ${row.timesTeamed} time(s), average rating ${row.history.toFixed(1)}`
    );
  }
  if (row.availability) reasons.push(`Availability: ${row.availability}, timezone ${row.timezone}`);

  return {
    githubLogin: row.githubLogin,
    name: row.name,
    avatarUrl: row.avatarUrl ?? null,
    isDemo: Boolean(row.isDemo),
    timezone: row.timezone ?? null,
    availability: row.availability ?? null,
    score,
    fills: fills.map(({ name, level }) => ({ name, level })),
    history: hasHistory ? { timesTeamed: row.timesTeamed, averageRating: row.history } : null,
    reasons,
  };
}

function pickBestIntro(rows) {
  const strength = (r) => Math.min(r.ratingFrom, r.ratingTo) * 10 + r.ratingFrom + r.ratingTo;
  return rows.reduce((best, row) => (!best || strength(row) > strength(best) ? row : best), null);
}

// Adds a warm-intro path to candidates who haven't worked with the team directly.
async function attachIntros(candidates, team) {
  const targets = candidates.filter((c) => !c.history).map((c) => c.githubLogin);
  if (!targets.length) return candidates;

  const rows = await matchRepository.findIntroducers({ team, candidates: targets });
  const byCandidate = new Map();
  for (const row of rows) {
    if (!byCandidate.has(row.toLogin)) byCandidate.set(row.toLogin, []);
    byCandidate.get(row.toLogin).push(row);
  }

  return candidates
    .map((candidate) => {
      const best = pickBestIntro(byCandidate.get(candidate.githubLogin) ?? []);
      if (!best) return candidate;

      const weakestLink = Math.min(best.ratingFrom, best.ratingTo);
      return {
        ...candidate,
        score: Math.min(100, candidate.score + (weakestLink - 2) * 3),
        intro: {
          chain: [
            { name: best.fromName, role: 'team' },
            { name: best.viaName, role: 'via' },
            { name: candidate.name, role: 'candidate' },
          ],
          ratings: [best.ratingFrom, best.ratingTo],
        },
        reasons: [
          ...candidate.reasons,
          `Warm intro: ask ${best.viaName}, who worked with ${best.fromName} (rated ${best.ratingFrom}/5) and with ${candidate.name} (rated ${best.ratingTo}/5)`,
        ],
      };
    })
    .sort((a, b) => b.score - a.score);
}

export async function findTeammates({ me, needed, teammates = [], limit = 8 }) {
  const known = await skillRepository.listSkills();
  const canonical = new Map(known.map((s) => [s.name.toLowerCase(), s.name]));
  const lookup = (name) => canonical.get(name.trim().toLowerCase());

  const wanted = [...new Set(needed.map(lookup).filter(Boolean))];
  const unknown = needed.filter((name) => !lookup(name));

  const team = [me, ...teammates.filter((login) => login !== me)];
  const have = new Set(await personRepository.getSkillNames(team));
  const gap = wanted.filter((skill) => !have.has(skill));
  const alreadyCovered = wanted.filter((skill) => have.has(skill));

  if (!gap.length) return { gap, alreadyCovered, unknown, candidates: [] };

  const rows = await matchRepository.findCandidates({ team, gap });
  const ranked = rows
    .map((row) => rankCandidate(row, gap))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const candidates = await attachIntros(ranked, team);
  return { gap, alreadyCovered, unknown, candidates };
}