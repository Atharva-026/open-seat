import { getGraph } from '../db/client.js';

const read = async (query, params = {}) => (await (await getGraph()).roQuery(query, { params })).data;
const write = async (query, params = {}) => { await (await getGraph()).query(query, { params }); };

export const getMyTeamIds = async (login) =>
  (await read('MATCH (:Person {githubLogin: $login})-[:MEMBER_OF]->(t:Team) RETURN t.id AS id', { login }))
    .map((row) => row.id);

export const listOpenSeats = (excludeTeamIds) =>
  read(
    `MATCH (t:Team)-[:POSTED]->(s:Seat)
     WHERE s.status = 'open' AND NOT t.id IN $excludeTeamIds
     OPTIONAL MATCH (s)-[:NEEDS]->(k:Skill)
     WITH t, s, collect(k.name) AS needs
     OPTIONAL MATCH (m:Person)-[:MEMBER_OF]->(t)
     WITH t, s, needs, count(m) AS memberCount
     OPTIONAL MATCH (o:Person) WHERE o.githubLogin = t.createdBy
     RETURN s.id AS id, s.title AS title, s.pitch AS pitch, coalesce(s.postedAt, 0) AS postedAt,
            coalesce(s.isDemo, false) AS isDemo, t.id AS teamId, t.name AS teamName,
            coalesce(t.size, 4) AS size, memberCount, needs, o.name AS ownerName
     ORDER BY postedAt DESC`,
    { excludeTeamIds }
  );

export const getSeatsForTeams = (teamIds) =>
  read(
    `MATCH (t:Team)-[:POSTED]->(s:Seat)
     WHERE t.id IN $teamIds AND s.status <> 'closed'
     OPTIONAL MATCH (s)-[:NEEDS]->(k:Skill)
     RETURN t.id AS teamId, s.id AS id, s.title AS title, s.pitch AS pitch, s.status AS status,
            collect(k.name) AS needs`,
    { teamIds }
  );

// People on a team that you have worked with directly.
export const findDirectHistory = (me, teamIds) =>
  read(
    `MATCH (t:Team)<-[:MEMBER_OF]-(m:Person)
     WHERE t.id IN $teamIds AND m.githubLogin <> $me
     MATCH (a:Person {githubLogin: $me})-[d:TEAMED_WITH]-(m)
     RETURN t.id AS teamId, m.name AS memberName, d.rating AS rating`,
    { me, teamIds }
  );

// Someone who worked with you and with a person on that team (both ratings 3 or higher).
export const findViaHistory = (me, teamIds) =>
  read(
    `MATCH (t:Team)<-[:MEMBER_OF]-(m:Person)
     WHERE t.id IN $teamIds AND m.githubLogin <> $me
     MATCH (a:Person {githubLogin: $me})-[t1:TEAMED_WITH]-(mid:Person)-[t2:TEAMED_WITH]-(m)
     WHERE t1.rating >= 3 AND t2.rating >= 3
       AND mid.githubLogin <> $me AND mid.githubLogin <> m.githubLogin
     RETURN t.id AS teamId, mid.name AS viaName, m.name AS memberName,
            t1.rating AS ratingA, t2.rating AS ratingB`,
    { me, teamIds }
  );

export const getMyRequests = (login) =>
  read(
    `MATCH (:Person {githubLogin: $login})-[r:REQUESTED]->(s:Seat)<-[:POSTED]-(t:Team)
     RETURN r.id AS id, r.status AS status, coalesce(r.simulated, false) AS simulated,
            r.at AS requestedAt, s.id AS seatId, s.title AS seatTitle, t.id AS teamId, t.name AS teamName
     ORDER BY requestedAt DESC`,
    { login }
  );

export const getSeat = async (id) =>
  (await read(
    `MATCH (t:Team)-[:POSTED]->(s:Seat {id: $id})
     OPTIONAL MATCH (o:Person) WHERE o.githubLogin = t.createdBy
     RETURN s.id AS id, s.status AS status, s.title AS title, t.id AS teamId,
            t.createdBy AS ownerLogin, coalesce(o.isDemo, false) AS ownerIsDemo`,
    { id }
  ))[0] ?? null;

export const hasRequested = async (login, seatId) =>
  (await read(
    `MATCH (:Person {githubLogin: $login})-[r:REQUESTED]->(:Seat {id: $seatId}) RETURN count(r) AS n`,
    { login, seatId }
  ))[0]?.n > 0;

export const getSeatCapacity = async (teamId) =>
  (await read(
    `MATCH (t:Team {id: $teamId})
     OPTIONAL MATCH (m:Person)-[:MEMBER_OF]->(t)
     WITH t, count(m) AS members
     OPTIONAL MATCH (t)-[inv:INVITED]->(:Person) WHERE inv.status = 'pending'
     WITH t, members, count(inv) AS pending
     OPTIONAL MATCH (t)-[:POSTED]->(s:Seat) WHERE s.status = 'open'
     RETURN t.createdBy AS createdBy, coalesce(t.size, 4) AS size, members, pending, count(s) AS openSeats`,
    { teamId }
  ))[0] ?? null;

export const createSeat = ({ id, teamId, title, pitch, skills }) =>
  write(
    `MATCH (t:Team {id: $teamId})
     CREATE (s:Seat {id: $id, title: $title, pitch: $pitch, status: 'open', postedAt: $now, isDemo: false})
     CREATE (t)-[:POSTED]->(s)
     WITH s
     UNWIND $skills AS skillName
     MATCH (k:Skill {name: skillName})
     CREATE (s)-[:NEEDS]->(k)`,
    { id, teamId, title, pitch, skills, now: Date.now() }
  );

export const setSeatStatus = (id, status) =>
  write('MATCH (s:Seat {id: $id}) SET s.status = $status', { id, status });

export const createRequest = ({ id, seatId, login, message }) =>
  write(
    `MATCH (p:Person {githubLogin: $login}), (s:Seat {id: $seatId})
     CREATE (p)-[:REQUESTED {id: $id, status: 'pending', message: $message, at: $now, simulated: false}]->(s)`,
    { id, seatId, login, message, now: Date.now() }
  );

export const getRequest = async (id) =>
  (await read(
    `MATCH (p:Person)-[r:REQUESTED]->(s:Seat)<-[:POSTED]-(t:Team)
     WHERE r.id = $id
     RETURN r.id AS id, r.status AS status, p.githubLogin AS login, p.name AS name,
            s.id AS seatId, s.title AS seatTitle, s.status AS seatStatus,
            t.id AS teamId, t.createdBy AS ownerLogin`,
    { id }
  ))[0] ?? null;

export const answerRequest = ({ id, accepted, simulated }) =>
  write(
    `MATCH ()-[r:REQUESTED]->() WHERE r.id = $id
     SET r.status = $status, r.respondedAt = $now, r.simulated = $simulated`,
    { id, status: accepted ? 'accepted' : 'declined', simulated, now: Date.now() }
  );

export const getIncomingRequests = (owner) =>
  read(
    `MATCH (p:Person)-[r:REQUESTED]->(s:Seat)<-[:POSTED]-(t:Team)
     WHERE t.createdBy = $owner AND r.status = 'pending' AND s.status = 'open'
     RETURN r.id AS id, r.message AS message, r.at AS requestedAt,
            p.githubLogin AS login, p.name AS name, coalesce(p.isDemo, false) AS isDemo,
            s.title AS seatTitle, t.id AS teamId, t.name AS teamName
     ORDER BY requestedAt DESC`,
    { owner }
  );