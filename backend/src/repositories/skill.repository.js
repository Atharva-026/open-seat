import { getGraph } from '../db/client.js';

export async function listSkills() {
  const graph = await getGraph();
  const res = await graph.roQuery(
    'MATCH (s:Skill) RETURN s.name AS name, s.category AS category ORDER BY s.category, s.name'
  );
  return res.data;
}

// How many other people are strong (level 3 or higher) in each skill area.
export async function countPeopleByCategory(excludeLogin) {
  const graph = await getGraph();
  const res = await graph.roQuery(
    `MATCH (p:Person)-[r:HAS_SKILL]->(s:Skill)
     WHERE r.level >= 3 AND p.githubLogin <> $exclude
     RETURN s.category AS category, count(DISTINCT p) AS people`,
    { params: { exclude: excludeLogin } }
  );
  return res.data;
}