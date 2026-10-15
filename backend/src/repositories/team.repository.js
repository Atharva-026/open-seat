import { getGraph } from '../db/client.js';

export async function createTeam({ id, name, hackathonId, hackathonName, members }) {
  const graph = await getGraph();
  await graph.query(
    `MERGE (h:Hackathon {id: $hackathonId})
     SET h.name = $hackathonName, h.isDemo = false
     CREATE (t:Team {id: $id, name: $name, outcome: 'in progress', isDemo: false})
     CREATE (t)-[:ENTERED]->(h)
     WITH t
     UNWIND $members AS login
     MATCH (p:Person {githubLogin: login})
     MERGE (p)-[:MEMBER_OF]->(t)`,
    { params: { id, name, hackathonId, hackathonName, members } }
  );
}

export async function getTeams(githubLogin) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    `MATCH (:Person {githubLogin: $githubLogin})-[:MEMBER_OF]->(t:Team)
     MATCH (m:Person)-[:MEMBER_OF]->(t)
     OPTIONAL MATCH (t)-[:ENTERED]->(h:Hackathon)
     RETURN t.id AS id, t.name AS name, h.name AS hackathon,
            collect({githubLogin: m.githubLogin, name: m.name, isDemo: m.isDemo}) AS members`,
    { params: { githubLogin } }
  );
  return res.data;
}

export async function getTeam(id) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    `MATCH (t:Team {id: $id})-[:ENTERED]->(h:Hackathon)
     MATCH (m:Person)-[:MEMBER_OF]->(t)
     RETURN h.id AS hackathonId, collect(m.githubLogin) AS members`,
    { params: { id } }
  );
  return res.data[0] ?? null;
}

export async function saveFeedback({ from, hackathonId, entries }) {
  const graph = await getGraph();
  await graph.query(
    `UNWIND $entries AS e
     MATCH (a:Person {githubLogin: $from}), (b:Person {githubLogin: e.to})
     MERGE (a)-[t:TEAMED_WITH {hackathon: $hackathonId}]->(b)
     SET t.rating = e.rating, t.note = e.note`,
    { params: { from, hackathonId, entries } }
  );
}