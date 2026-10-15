function levelFor(repoCount) {
  if (repoCount >= 8) return 5;
  if (repoCount >= 5) return 4;
  if (repoCount >= 3) return 3;
  if (repoCount >= 2) return 2;
  return 1;
}

// Turns a user's own public repos into skills with evidence (repo names).
export function deriveSkills(repos) {
  const tally = new Map();

  const add = (name, category, repoName) => {
    const key = `${category}:${name}`;
    if (!tally.has(key)) tally.set(key, { name, category, repos: [] });
    tally.get(key).repos.push(repoName);
  };

  for (const repo of repos.filter((r) => !r.fork)) {
    if (repo.language) add(repo.language, 'language', repo.name);
    for (const topic of repo.topics ?? []) add(topic.toLowerCase(), 'topic', repo.name);
  }

  return [...tally.values()].map(({ name, category, repos: names }) => ({
    name,
    category,
    level: levelFor(names.length),
    evidence: names.slice(0, 5),
  }));
}