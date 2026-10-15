import { fetchUser, fetchPublicRepos } from './github.service.js';
import { collectDependencySkills } from './dependencies.service.js';
import { deriveSkills } from './skills.service.js';
import * as personRepository from '../repositories/person.repository.js';

const MAX_REPOS_SCANNED = 12;

// The GitHub token is used here only and never stored.
export async function syncProfileFromGithub(token) {
  const user = await fetchUser(token);
  const repos = await fetchPublicRepos(user.login, token);

  const scanned = repos.filter((r) => !r.fork).slice(0, MAX_REPOS_SCANNED);
  const dependencyHits = await collectDependencySkills(user.login, scanned, token);

  await personRepository.upsertPerson({
    githubLogin: user.login,
    name: user.name ?? user.login,
    avatarUrl: user.avatar_url,
  });
  await personRepository.replaceSkills(user.login, deriveSkills(repos, dependencyHits));

  return user.login;
}

export const getProfile = (githubLogin) => personRepository.getProfile(githubLogin);