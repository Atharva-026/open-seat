import { getGraph } from '../db/client.js';

export async function upsertPerson({ githubLogin, name, avatarUrl }) {
  const graph = await getGraph();
  await graph.query(
    `MERGE (p:Person {githubLogin: $githubLogin})
     SET p.name = $name, p.avatarUrl = $avatarUrl, p.isDemo = false`,
    { params: { githubLogin, name, avatarUrl } }
  );
}

export async function replaceSkills(githubLogin, skills) {
  const graph = await getGraph();
  await graph.query(
    'MATCH (:Person {githubLogin: $githubLogin})-[r:HAS_SKILL]->() DELETE r',
    { params: { githubLogin } }
  );
  if (!skills.length) return;
  await graph.query(
    `MATCH (p:Person {githubLogin: $githubLogin})
     UNWIND $skills AS s
     MERGE (sk:Skill {name: s.name})
     SET sk.category = s.category
     MERGE (p)-[r:HAS_SKILL]->(sk)
     SET r.level = s.level, r.evidence = s.evidence`,
    { params: { githubLogin, skills } }
  );
}

export async function getProfile(githubLogin) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    `MATCH (p:Person {githubLogin: $githubLogin})
     OPTIONAL MATCH (p)-[r:HAS_SKILL]->(s:Skill)
     RETURN p.githubLogin AS githubLogin, p.name AS name, p.avatarUrl AS avatarUrl,
            collect({name: s.name, category: s.category, level: r.level, evidence: r.evidence}) AS skills`,
    { params: { githubLogin } }
  );
  const row = res.data?.[0];
  if (!row) return null;
  return { ...row, skills: row.skills.filter((s) => s.name) };
}

export async function getSkillNames(githubLogins) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    `MATCH (p:Person)-[:HAS_SKILL]->(s:Skill)
     WHERE p.githubLogin IN $githubLogins
     RETURN DISTINCT s.name AS name`,
    { params: { githubLogins } }
  );
  return res.data.map((row) => row.name);
}

export async function findExisting(githubLogins) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    'MATCH (p:Person) WHERE p.githubLogin IN $githubLogins RETURN p.githubLogin AS githubLogin',
    { params: { githubLogins } }
  );
  return res.data.map((row) => row.githubLogin);
}

export async function getPastTeammates(githubLogin) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    `MATCH (:Person {githubLogin: $githubLogin})-[t:TEAMED_WITH]-(o:Person)
     RETURN o.githubLogin AS githubLogin, o.name AS name, o.isDemo AS isDemo,
            avg(t.rating) AS rating, count(t) AS times
     ORDER BY rating DESC LIMIT 20`,
    { params: { githubLogin } }
  );
  return res.data;
}
