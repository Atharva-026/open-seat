// Top three skill areas for one person, with the repositories that prove them.
export function evidenceFor(skillRows, login) {
  return skillRows
    .filter((row) => row.login === login)
    .slice(0, 3)
    .map(({ name, level, evidence }) => ({ name, level, repos: (evidence ?? []).slice(0, 3) }));
}