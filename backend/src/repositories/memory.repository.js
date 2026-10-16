import { getUserGraph } from '../db/client.js';

// Reads use query(), not roQuery(): a new user's graph doesn't exist yet,
// and read-only queries fail on a missing graph.

export async function upsertPreference(githubLogin, key, value) {
  const graph = await getUserGraph(githubLogin);
  await graph.query(
    'MERGE (p:Preference {key: $key}) SET p.value = $value, p.updatedAt = $now',
    { params: { key, value, now: Date.now() } }
  );
}

export async function deletePreference(githubLogin, key) {
  const graph = await getUserGraph(githubLogin);
  await graph.query('MATCH (p:Preference {key: $key}) DELETE p', { params: { key } });
}

export async function getPreferences(githubLogin) {
  const graph = await getUserGraph(githubLogin);
  const res = await graph.query(
    'MATCH (p:Preference) RETURN p.key AS key, p.value AS value ORDER BY p.key'
  );
  return res.data ?? [];
}

export async function addEpisode(githubLogin, { id, question, gap, recommended }, keep) {
  const graph = await getUserGraph(githubLogin);
  await graph.query(
    'CREATE (:Episode {id: $id, question: $question, gap: $gap, recommended: $recommended, at: $now})',
    { params: { id, question, gap, recommended, now: Date.now() } }
  );
  await graph.query(
    `MATCH (e:Episode) WITH e ORDER BY e.at DESC SKIP ${Number(keep)} DELETE e`
  );
}

export async function getRecentEpisodes(githubLogin, limit) {
  const graph = await getUserGraph(githubLogin);
  const res = await graph.query(
    `MATCH (e:Episode)
     RETURN e.id AS id, e.question AS question, e.gap AS gap, e.recommended AS recommended, e.at AS at
     ORDER BY e.at DESC LIMIT ${Number(limit)}`
  );
  return res.data ?? [];
}

export async function deleteEverything(githubLogin) {
  const graph = await getUserGraph(githubLogin);
  await graph.query('MATCH (n) DETACH DELETE n');
}

export async function addTeamHistory(githubLogin, { teamId, name, members }) {
  const graph = await getUserGraph(githubLogin);
  await graph.query(
    'MERGE (h:TeamHistory {teamId: $teamId}) SET h.name = $name, h.members = $members, h.at = $now',
    { params: { teamId, name, members, now: Date.now() } }
  );
}

// Returns true if this team was already counted, then marks it as counted.
export async function markTeamRated(githubLogin, teamId) {
  const graph = await getUserGraph(githubLogin);
  const res = await graph.query(
    `MERGE (h:TeamHistory {teamId: $teamId})
     WITH h, coalesce(h.rated, false) AS was
     SET h.rated = true
     RETURN was`,
    { params: { teamId } }
  );
  return res.data?.[0]?.was === true;
}

export async function upsertPattern(githubLogin, { key, categories, ratingSum, n }) {
  const graph = await getUserGraph(githubLogin);
  await graph.query(
    `MERGE (p:Pattern {key: $key})
     ON CREATE SET p.categories = $categories, p.ratingSum = $ratingSum, p.count = $n, p.updatedAt = $now
     ON MATCH SET p.ratingSum = p.ratingSum + $ratingSum, p.count = p.count + $n, p.updatedAt = $now`,
    { params: { key, categories, ratingSum, n, now: Date.now() } }
  );
}

export async function getPatterns(githubLogin, limit) {
  const graph = await getUserGraph(githubLogin);
  const res = await graph.query(
    `MATCH (p:Pattern)
     RETURN p.key AS key, p.categories AS categories, p.ratingSum AS ratingSum, p.count AS count
     ORDER BY p.ratingSum / p.count DESC LIMIT ${Number(limit)}`
  );
  return res.data ?? [];
}