import { getGraph, closeClient } from '../db/client.js';

const graph = await getGraph();

await graph.query(
  'CREATE (:Person {githubLogin: $login, isDemo: false})',
  { params: { login: 'test-user' } }
);

const res = await graph.query('MATCH (p:Person) RETURN p.githubLogin AS login');
console.log(res.data);

await graph.query("MATCH (p:Person {githubLogin: 'test-user'}) DELETE p");
await closeClient();