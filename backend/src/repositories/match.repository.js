import { getGraph } from '../db/client.js';

// People outside the team who have at least one of the gap skills,
// plus their past collaboration ratings with anyone on the team.
export async function findCandidates({ team, gap }) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    `MATCH (c:Person)-[h:HAS_SKILL]->(s:Skill)
     WHERE s.name IN $gap AND NOT c.githubLogin IN $team
     WITH c, collect({name: s.name, level: h.level, evidence: h.evidence}) AS fills
     OPTIONAL MATCH (m:Person)-[t:TEAMED_WITH]-(c)
     WHERE m.githubLogin IN $team
     WITH c, fills, avg(t.rating) AS history, count(t) AS timesTeamed
     RETURN c.githubLogin AS githubLogin, c.name AS name, c.avatarUrl AS avatarUrl,
            c.timezone AS timezone, c.availability AS availability, c.isDemo AS isDemo,
            fills, history, timesTeamed`,
    { params: { team, gap } }
  );
  return res.data;
}