import { getGraph } from '../db/client.js';

export async function clearDemoData() {
  const graph = await getGraph();
  await graph.query('MATCH (n) WHERE n.isDemo = true DETACH DELETE n');
}

export async function insertPeople(people) {
  const graph = await getGraph();
  const rows = people.map(({ githubLogin, name, timezone, availability }) => ({
    githubLogin, name, timezone, availability,
  }));
  await graph.query(
    `UNWIND $rows AS r
     MERGE (p:Person {githubLogin: r.githubLogin})
     SET p.name = r.name, p.timezone = r.timezone, p.availability = r.availability, p.isDemo = true`,
    { params: { rows } }
  );
}

export async function insertSkills(people) {
  const graph = await getGraph();
  const links = people.flatMap((p) =>
    p.skills.map((s) => ({ login: p.githubLogin, ...s }))
  );
  await graph.query(
    `UNWIND $links AS l
     MATCH (p:Person {githubLogin: l.login})
     MERGE (s:Skill {name: l.name})
     SET s.category = l.category
     MERGE (p)-[r:HAS_SKILL]->(s)
     SET r.level = l.level, r.evidence = l.evidence`,
    { params: { links } }
  );
}

export async function insertTeams(teams) {
  const graph = await getGraph();
  await graph.query(
    `UNWIND $teams AS t
     MERGE (h:Hackathon {id: t.hackathonId})
     SET h.name = t.hackathonName, h.isDemo = true
     MERGE (tm:Team {id: t.id})
     SET tm.name = t.name, tm.outcome = t.outcome, tm.isDemo = true
     MERGE (tm)-[:ENTERED]->(h)
     WITH tm, t
     UNWIND t.members AS login
     MATCH (p:Person {githubLogin: login})
     MERGE (p)-[:MEMBER_OF]->(tm)`,
    { params: { teams } }
  );
}

export async function insertTeamedWith(pairs) {
  const graph = await getGraph();
  await graph.query(
    `UNWIND $pairs AS e
     MATCH (a:Person {githubLogin: e.a}), (b:Person {githubLogin: e.b})
     MERGE (a)-[t:TEAMED_WITH {hackathon: e.hackathonId}]->(b)
     SET t.rating = e.rating, t.note = e.note`,
    { params: { pairs } }
  );
}

export async function clearDemoBoard() {
  const graph = await getGraph();
  await graph.query("MATCH (t:Team) WHERE t.id STARTS WITH 'demo-board-' DETACH DELETE t");
  await graph.query('MATCH (s:Seat) WHERE s.isDemo = true DETACH DELETE s');
}

export async function insertBoard(teams) {
  const graph = await getGraph();
  await graph.query(
    `MERGE (h:Hackathon {id: 'graph-hacks-2026'})
     SET h.name = 'Graph Hacks 2026'
     WITH h
     UNWIND $teams AS t
     CREATE (tm:Team {id: t.id, name: t.name, status: 'confirmed', outcome: 'in progress',
                      createdBy: t.createdBy, size: t.size, createdAt: $now - t.agoMs, isDemo: true})
     CREATE (tm)-[:ENTERED]->(h)
     WITH tm, t
     UNWIND t.members AS login
     MATCH (p:Person {githubLogin: login})
     MERGE (p)-[:MEMBER_OF]->(tm)`,
    { params: { teams, now: Date.now() } }
  );
  await graph.query(
    `UNWIND $teams AS t
     MATCH (tm:Team {id: t.id})
     CREATE (s:Seat {id: t.seatId, title: t.seatTitle, pitch: t.seatPitch, status: 'open',
                     postedAt: $now - t.agoMs, isDemo: true})
     CREATE (tm)-[:POSTED]->(s)
     WITH s, t
     UNWIND t.seatSkills AS skillName
     MATCH (k:Skill {name: skillName})
     CREATE (s)-[:NEEDS]->(k)`,
    { params: { teams, now: Date.now() } }
  );
}