import { FalkorDB } from 'falkordb';
import { env } from '../config/env.js';

export const GRAPHS = { community: 'community' };

let client;

export async function getClient() {
  if (!client) {
    client = await FalkorDB.connect({
      socket: { host: env.falkordb.host, port: env.falkordb.port },
    });
  }
  return client;
}

export async function getGraph(name = GRAPHS.community) {
  return (await getClient()).selectGraph(name);
}

export async function closeClient() {
  if (client) {
    await client.close();
    client = undefined;
  }
}

// One private graph per user, e.g. "user_atharva-026".
export function userGraphName(githubLogin) {
  if (!/^[A-Za-z0-9-]{1,39}$/.test(githubLogin)) throw new Error('Invalid GitHub login');
  return `user_${githubLogin.toLowerCase()}`;
}

export const getUserGraph = (githubLogin) => getGraph(userGraphName(githubLogin));