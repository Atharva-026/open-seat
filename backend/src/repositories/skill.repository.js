import { getGraph } from '../db/client.js';

export async function listSkills() {
  const graph = await getGraph();
  const res = await graph.roQuery(
    'MATCH (s:Skill) RETURN s.name AS name, s.category AS category ORDER BY s.category, s.name'
  );
  return res.data;
}