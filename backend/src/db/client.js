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