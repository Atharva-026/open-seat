function levelFor(repoCount) {
  if (repoCount >= 8) return 5;
  if (repoCount >= 5) return 4;
  if (repoCount >= 3) return 3;
  if (repoCount >= 2) return 2;
  return 1;
}

// Combines repo languages, topics and detected dependencies into skills,
// each with the repos that prove it.
export function deriveSkills(repos, dependencyHits = []) {
  const tally = new Map();

  const add = (name, category, repoName) => {
    const key = `${category}:${name}`;
    if (!tally.has(key)) tally.set(key, { name, category, repos: new Set() });
    tally.get(key).repos.add(repoName);
  };

  for (const repo of repos.filter((r) => !r.fork)) {
    if (repo.language) add(repo.language, 'language', repo.name);
    for (const topic of repo.topics ?? []) add(topic.toLowerCase(), 'topic', repo.name);
  }
  for (const hit of dependencyHits) {
    for (const skill of hit.skills) add(skill.name, skill.category, hit.repo);
  }

  return [...tally.values()].map(({ name, category, repos: names }) => ({
    name,
    category,
    level: levelFor(names.size),
    evidence: [...names].slice(0, 5),
  }));
}