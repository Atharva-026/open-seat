import { getGraph } from '../db/client.js';

export async function createTeam({ id, name, createdBy, size, hackathonId, hackathonName }) {
  const graph = await getGraph();
  await graph.query(
    `MERGE (h:Hackathon {id: $hackathonId})
     SET h.name = $hackathonName
     CREATE (t:Team {id: $id, name: $name, status: 'forming', outcome: 'in progress',
                     createdBy: $createdBy, size: $size, createdAt: $now, isDemo: false})
     CREATE (t)-[:ENTERED]->(h)
     WITH t
     MATCH (p:Person {githubLogin: $createdBy})
     CREATE (p)-[:MEMBER_OF]->(t)`,
    { params: { id, name, createdBy, size, hackathonId, hackathonName, now: Date.now() } }
  );
}

export async function getTeams(githubLogin) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    `MATCH (:Person {githubLogin: $githubLogin})-[:MEMBER_OF]->(t:Team)
     MATCH (m:Person)-[:MEMBER_OF]->(t)
     OPTIONAL MATCH (t)-[:ENTERED]->(h:Hackathon)
     RETURN t.id AS id, t.name AS name, coalesce(t.status, 'confirmed') AS status, h.name AS hackathon,
            t.size AS size, t.createdBy AS createdBy, coalesce(t.createdAt, 0) AS createdAt,
            collect({githubLogin: m.githubLogin, name: m.name, isDemo: m.isDemo}) AS members
     ORDER BY createdAt DESC`,
    { params: { githubLogin } }
  );
  return res.data;
}

export async function getTeamForInvite(id) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    `MATCH (t:Team {id: $id})
     OPTIONAL MATCH (m:Person)-[:MEMBER_OF]->(t)
     WITH t, collect(m.githubLogin) AS members
     OPTIONAL MATCH (t)-[inv:INVITED {status: 'pending'}]->(p:Person)
     RETURN t.name AS name, t.createdBy AS createdBy, t.size AS size, members,
            collect(p.githubLogin) AS pending`,
    { params: { id } }
  );
  return res.data[0] ?? null;
}

export async function getInvitesForTeams(teamIds) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    `MATCH (t:Team)-[inv:INVITED]->(p:Person)
     WHERE t.id IN $teamIds
     RETURN t.id AS teamId, inv.id AS id, inv.status AS status, inv.simulated AS simulated,
            inv.forSkills AS forSkills,
            p.githubLogin AS login, p.name AS name, p.isDemo AS isDemo
     ORDER BY inv.at`,
    { params: { teamIds } }
  );
  return res.data;
}

export async function getEventsForTeams(teamIds) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    `MATCH (t:Team)-[:HAS_EVENT]->(e:AgentEvent)
     WHERE t.id IN $teamIds
     RETURN t.id AS teamId, e.id AS id, e.agent AS agent, e.action AS action, e.detail AS detail, e.at AS at
     ORDER BY e.at`,
    { params: { teamIds } }
  );
  return res.data;
}

export async function getTeam(id) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    `MATCH (t:Team {id: $id})-[:ENTERED]->(h:Hackathon)
     MATCH (m:Person)-[:MEMBER_OF]->(t)
     RETURN h.id AS hackathonId, coalesce(t.status, 'confirmed') AS status, collect(m.githubLogin) AS members`,
    { params: { id } }
  );
  return res.data[0] ?? null;
}

export async function getTeamOutcome(id) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    `MATCH (t:Team {id: $id})
     MATCH (m:Person)-[:MEMBER_OF]->(t)
     WITH t, collect(m.githubLogin) AS members
     OPTIONAL MATCH (t)-[:INVITED {status: 'declined'}]->(d:Person)
     RETURN t.name AS name, t.createdBy AS createdBy, members, collect(d.githubLogin) AS declined`,
    { params: { id } }
  );
  return res.data[0];
}

export async function createInvite({ teamId, id, login, message, forSkills = [] }) {
  const graph = await getGraph();
  await graph.query(
    `MATCH (t:Team {id: $teamId}), (p:Person {githubLogin: $login})
     CREATE (t)-[:INVITED {id: $id, status: 'pending', message: $message, at: $now,
                           simulated: false, forSkills: $forSkills}]->(p)`,
    { params: { teamId, id, login, message, forSkills, now: Date.now() } }
  );
}

export async function getInvite(id) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    `MATCH (t:Team)-[inv:INVITED {id: $id}]->(p:Person)
     RETURN inv.id AS id, inv.status AS status, t.id AS teamId, p.githubLogin AS login, p.name AS name`,
    { params: { id } }
  );
  return res.data[0] ?? null;
}

export async function answerInvite({ id, teamId, login, accepted, simulated }) {
  const graph = await getGraph();
  await graph.query(
    `MATCH (:Team {id: $teamId})-[inv:INVITED {id: $id}]->(:Person)
     SET inv.status = $status, inv.respondedAt = $now, inv.simulated = $simulated`,
    { params: { id, teamId, status: accepted ? 'accepted' : 'declined', simulated, now: Date.now() } }
  );
  if (accepted) {
    await graph.query(
      `MATCH (t:Team {id: $teamId}), (p:Person {githubLogin: $login})
       MERGE (p)-[:MEMBER_OF]->(t)`,
      { params: { teamId, login } }
    );
  }
}

export async function countPendingInvites(teamId) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    `MATCH (:Team {id: $teamId})-[inv:INVITED {status: 'pending'}]->(:Person)
     RETURN count(inv) AS pending`,
    { params: { teamId } }
  );
  return res.data[0]?.pending ?? 0;
}

export async function setTeamStatus(teamId, status) {
  const graph = await getGraph();
  await graph.query('MATCH (t:Team {id: $teamId}) SET t.status = $status', { params: { teamId, status } });
}

export async function addEvent({ id, teamId, agent, action, detail }) {
  const graph = await getGraph();
  await graph.query(
    `MATCH (t:Team {id: $teamId})
     CREATE (t)-[:HAS_EVENT]->(:AgentEvent {id: $id, agent: $agent, action: $action, detail: $detail, at: $now})`,
    { params: { id, teamId, agent, action, detail, now: Date.now() } }
  );
}

export async function getInbox(githubLogin) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    `MATCH (t:Team)-[inv:INVITED {status: 'pending'}]->(:Person {githubLogin: $githubLogin})
     MATCH (c:Person)
     WHERE c.githubLogin = t.createdBy
     RETURN inv.id AS id, inv.message AS message, t.id AS teamId, t.name AS teamName,
            c.name AS fromName, c.githubLogin AS fromLogin
     ORDER BY inv.at DESC`,
    { params: { githubLogin } }
  );
  return res.data;
}

export async function saveFeedback({ from, hackathonId, entries }) {
  const graph = await getGraph();
  await graph.query(
    `UNWIND $entries AS e
     MATCH (a:Person {githubLogin: $from}), (b:Person {githubLogin: e.to})
     MERGE (a)-[t:TEAMED_WITH {hackathon: $hackathonId}]->(b)
     SET t.rating = e.rating, t.note = e.note, t.delivered = e.delivered`,
    { params: { from, hackathonId, entries } }
  );
}

// Skill categories a team covers at a solid level (3 or higher).
export async function getTeamCategories(members) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    `MATCH (p:Person)-[r:HAS_SKILL]->(s:Skill)
     WHERE p.githubLogin IN $members AND r.level >= 3
     RETURN DISTINCT s.category AS category`,
    { params: { members } }
  );
  return res.data.map((row) => row.category).filter(Boolean);
}

// Strongest skill areas per person, with the repositories that prove them.
export async function getSkillsForPeople(logins) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    `MATCH (p:Person)-[r:HAS_SKILL]->(s:Skill)
     WHERE p.githubLogin IN $logins AND NOT s.category IN ['language', 'tooling', 'topic']
     RETURN p.githubLogin AS login, s.name AS name, r.level AS level, r.evidence AS evidence
     ORDER BY r.level DESC`,
    { params: { logins } }
  );
  return res.data;
}

export async function addMember(teamId, login) {
  const graph = await getGraph();
  await graph.query(
    `MATCH (t:Team {id: $teamId}), (p:Person {githubLogin: $login})
     MERGE (p)-[:MEMBER_OF]->(t)`,
    { params: { teamId, login } }
  );
}