import { fetchRepoFile } from './github.service.js';
import {
  NODE_PACKAGES, PYTHON_PACKAGES, NODE_MANIFESTS, PYTHON_MANIFESTS,
} from '../config/skillMap.js';

function fromPackageJson(text) {
  try {
    const pkg = JSON.parse(text);
    const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    return names.map((n) => NODE_PACKAGES[n]).filter(Boolean);
  } catch {
    return [];
  }
}

function fromRequirements(text) {
  return text
    .split('\n')
    .map((line) => line.trim().split(/[=<>~[;\s]/)[0].toLowerCase())
    .map((name) => PYTHON_PACKAGES[name])
    .filter(Boolean);
}

async function skillsForRepo(login, repoName, token) {
  const found = new Map();
  const scan = async (paths, parse) => {
    for (const path of paths) {
      const text = await fetchRepoFile(login, repoName, path, token);
      if (text) parse(text).forEach(([name, category]) => found.set(name, { name, category }));
    }
  };
  await scan(NODE_MANIFESTS, fromPackageJson);
  await scan(PYTHON_MANIFESTS, fromRequirements);
  return { repo: repoName, skills: [...found.values()] };
}

// One repo at a time per file (sequential), several repos in parallel.
export const collectDependencySkills = (login, repos, token) =>
  Promise.all(repos.map((repo) => skillsForRepo(login, repo.name, token)));