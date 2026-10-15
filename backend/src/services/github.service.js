import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

const API = 'https://api.github.com';
const OAUTH = 'https://github.com/login/oauth';

export function buildAuthorizeUrl(state) {
  const params = new URLSearchParams({
    client_id: env.github.clientId,
    redirect_uri: env.github.callbackUrl,
    scope: 'read:user',
    state,
  });
  return `${OAUTH}/authorize?${params}`;
}

export async function exchangeCodeForToken(code) {
  const res = await fetch(`${OAUTH}/access_token`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.github.clientId,
      client_secret: env.github.clientSecret,
      redirect_uri: env.github.callbackUrl,
      code,
    }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new HttpError(502, 'GitHub sign-in failed');
  return data.access_token;
}

async function githubGet(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) throw new HttpError(502, 'Could not read from GitHub');
  return res.json();
}

export const fetchUser = (token) => githubGet('/user', token);

export const fetchPublicRepos = (login, token) =>
  githubGet(`/users/${login}/repos?per_page=100&sort=updated&type=owner`, token);