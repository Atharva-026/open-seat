# Open Seat

**Find the teammate who fills the gap.** Open Seat is an AI agent that builds hackathon teams around skill gaps, remembers who worked well together, and shows the graph path behind every suggestion.

Built for **Graph Hacks** (WeMakeDevs x FalkorDB), tracks: **Agent Memory and Coordination** and **Agents That Act on Connected Data**. FalkorDB is the context layer for every agent.

- Live demo: https://open-seat-i2gc.onrender.com (the free server sleeps when idle, so the first load can take about a minute)
- Demo video: https://youtu.be/bK3m4vVFo0A
- Blog post: https://atharva026.hashnode.dev/a-team-is-a-number-of-seats

## What it does

1. **Sign in with GitHub.** The Profiler turns your public repositories into skills, each linked to the projects that prove it.
2. **Build a team in chat.** Pick a team size of 2 to 4. For each open seat, describe the role in plain English. The Matcher agent searches the graph and explains every result.
3. **Warm introductions.** Results show the path through people already on your team, for example `You ★5 Pooja ★4 Hana`.
4. **Invite and coordinate.** The Outreach agent drafts invitations, tracks replies, and confirms the team when every invitation is answered.
5. **Remember.** After the event you rate teammates. The Memory agent records the team and what worked, and future suggestions change.
6. **The Open Seats board:** teams post the seats they still need, and everyone sees them ranked by fit through the skills graph, with warm-introduction paths.

## How FalkorDB is used

FalkorDB holds all state, and the agents share it.

| Need | How |
|---|---|
| Gap coverage | Cypher subtracts the skills your team has (level 3 or higher) from the skills it needs and ranks people who fill the rest |
| Warm introductions | A two-hop query through `TEAMED_WITH` edges: a teammate who worked with someone on your team and with the candidate (both ratings 3 or higher) |
| Open Seats board | `Seat` nodes with `NEEDS` edges to `Skill` nodes, ranked per viewer by fit plus introduction paths; `REQUESTED` edges drive accept and decline |
| Shared state between agents | Team status, `INVITED` edges and `AgentEvent` nodes live in the graph; agents hand off through events and read the same state |
| Per-user memory | One private graph per user, `user_<githubLogin>`, in the same FalkorDB instance |
| Memory types | Semantic: `Preference`. Episodic: `Episode`, `TeamHistory`. Procedural: `Pattern` |

### Graph data model

**Shared graph `community`**

- `(:Person {githubLogin, name, avatarUrl, timezone, availability, isDemo})`
- `(:Skill {name, category})`
- `(:Team {id, name, status, size, createdBy, createdAt, isDemo})`
- `(:Seat {id, title, pitch, status, postedAt, isDemo})`
- `(:Hackathon {id, name})`
- `(:AgentEvent {id, agent, action, detail, at})`
- `(Person)-[:HAS_SKILL {level, evidence}]->(Skill)`
- `(Person)-[:MEMBER_OF]->(Team)`
- `(Team)-[:POSTED]->(Seat)`
- `(Seat)-[:NEEDS]->(Skill)`
- `(Person)-[:REQUESTED {id, status, message, at, simulated}]->(Seat)`
- `(Team)-[:ENTERED]->(Hackathon)`
- `(Team)-[:INVITED {id, status, message, at, simulated, forSkills}]->(Person)`
- `(Person)-[:TEAMED_WITH {rating, note, delivered, hackathon}]->(Person)`
- `(Team)-[:HAS_EVENT]->(AgentEvent)`

**Private graph `user_<githubLogin>`**

- `(:Preference {key, value, updatedAt})`: availability, timezone, notes
- `(:Episode {id, question, gap, recommended, at})`: past requests
- `(:TeamHistory {teamId, name, members, at, rated})`: confirmed teams
- `(:Pattern {key, categories, ratingSum, count, updatedAt})`: for example "teammates who add design: 4.8/5"

### Core queries

All Cypher lives in `backend/src/repositories`. The main ones:

```cypher
// Skills your team already covers (level 3 or higher counts as covered)
MATCH (p:Person)-[r:HAS_SKILL]->(s:Skill)
WHERE p.githubLogin IN $team AND r.level >= 3
RETURN DISTINCT s.name
```

```cypher
// Candidates for a skill gap, with past collaboration ratings
MATCH (c:Person)-[h:HAS_SKILL]->(s:Skill)
WHERE s.name IN $gap AND NOT c.githubLogin IN $team
WITH c, collect({name: s.name, level: h.level, evidence: h.evidence}) AS fills
OPTIONAL MATCH (m:Person)-[t:TEAMED_WITH]-(c) WHERE m.githubLogin IN $team
RETURN c, fills, avg(t.rating) AS history, count(t) AS timesTeamed
```

```cypher
// Warm introductions through a mutual teammate
MATCH (a:Person)-[t1:TEAMED_WITH]-(mid:Person)-[t2:TEAMED_WITH]-(b:Person)
WHERE a.githubLogin IN $team AND b.githubLogin IN $candidates
  AND NOT mid.githubLogin IN $team AND t1.rating >= 3 AND t2.rating >= 3
RETURN a, mid, b, t1.rating, t2.rating
```

```cypher
// Open Seats board: every open seat with the skills it needs and its team
MATCH (t:Team)-[:POSTED]->(s:Seat)
WHERE s.status = 'open' AND NOT t.id IN $excludeTeamIds
OPTIONAL MATCH (s)-[:NEEDS]->(k:Skill)
WITH t, s, collect(k.name) AS needs
OPTIONAL MATCH (m:Person)-[:MEMBER_OF]->(t)
WITH t, s, needs, count(m) AS memberCount
RETURN s.id AS id, s.title AS title, s.pitch AS pitch, t.id AS teamId,
       t.name AS teamName, memberCount, needs
```

## Agents

- **Profiler:** GitHub OAuth, then repository languages, topics and `package.json` / `requirements.txt` dependencies become skills with evidence.
- **Matcher** (Groq, tool calling): `list_skills`, `get_my_profile`, `get_profile_gaps`, `find_teammates`, `get_past_teammates`, `remember_preference`. It can ask a clarifying question, and every step it takes is shown in the UI.
- **Outreach:** drafts a personalised invitation (AI-written, with a template fallback), sends it, tracks replies, and confirms or closes the team.
- **Memory:** on `team.confirmed` it writes the team to each real member's private graph. On `feedback.submitted` it records which skill areas your teammates added and how you rated them.

Ranking: 60% gap coverage, 30% skill strength, 10% past collaboration, plus a small bonus for remembered preferences and for strong warm introductions.

## Real data and demo data

- **Real:** people who sign in with GitHub. Only public repositories are read. The GitHub token is used once and never stored.
- **Demo:** 40 synthetic personas (`backend/src/seed`, fixed random seed), 3 fictional past hackathons, and their ratings, plus 9 demo teams with an open seat each on the Open Seats board. They are marked `isDemo`, labelled "demo persona" in the UI, and their invitation replies are **simulated** and labelled so.

## Run it locally

Requirements: Node 22, Docker, a GitHub OAuth app, a Groq API key.

```bash
git clone https://github.com/Atharva-026/open-seat.git
cd open-seat
docker compose up -d                  # FalkorDB on 6379, browser on 3000
cp .env.example .env                  # then fill in the values
npm install
npm install --prefix backend
npm install --prefix frontend
npm run seed                          # demo community
npm run seed:board --prefix backend   # demo teams for the Open Seats board
npm run dev                           # backend :3001, frontend :5173
```

Create a GitHub OAuth app with homepage `http://localhost:5173` and callback `http://localhost:3001/auth/github/callback`, and put its client ID and secret in `.env`.

| Variable | Purpose |
|---|---|
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL` | GitHub sign-in |
| `SESSION_SECRET` | signs the session cookie |
| `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_FALLBACK_MODEL` | the agents' language model |
| `FALKORDB_HOST`, `FALKORDB_PORT` | database connection (default `localhost:6379`) |
| `FALKORDB_USERNAME`, `FALKORDB_PASSWORD`, `FALKORDB_TLS` | optional, for a hosted FalkorDB such as FalkorDB Cloud |
| `PORT`, `FRONTEND_URL` | server settings |

## Deployment

The live demo runs as one Render web service (the Express server also serves the built React app, so everything is on one origin) with the graph on a FalkorDB Cloud free instance.

- Build command: `npm run build`. Start command: `npm start`.
- Set the variables above in the host's environment settings, including `NODE_ENV=production`, `FRONTEND_URL`, `GITHUB_CALLBACK_URL` and the `FALKORDB_*` connection values.
- Use a separate GitHub OAuth app for production, with the live URL as homepage and `<live-url>/auth/github/callback` as the callback.
- Seed the hosted graph once with `npm run seed` and `npm run seed:board --prefix backend`, with the `FALKORDB_*` variables pointing at the hosted instance.

## Structure

```
backend/src/
  agents/        matcher, outreach, memory, tools, event bus
  controllers/ routes/ services/ repositories/   (all Cypher lives in repositories)
  seed/          synthetic community generator
frontend/src/
  app/ pages/ features/{landing,chat,teams,profile}/ components/ hooks/ api/
```

## Privacy

- Open Seat stores derived skills, not your repository contents.
- Your private graph holds only your preferences, requests and learned patterns. "Forget everything" on your profile page erases it.

## Known limitations

- Demo personas reply automatically, so invitation flows with real people need a second signed-in account.
- The Groq free tier is rate limited; the app falls back to a second model. The AI matcher and team and invitation creation are also rate limited per visitor.
- Agents hand off through an in-process event bus, so run a single server instance.
- Skill evidence comes from profile repositories, not commit statistics.
- Deleting your profile from the shared graph is not built yet. "Forget everything" erases your private memory only.
- The free hosting tiers sleep when idle, and the free FalkorDB Cloud instance has no persistence, so the hosted demo data may need to be re-seeded.

## How AI tools were used

I used Claude as a coding assistant while building this. I chose the idea and the data model, tested every feature, and can explain the code. The agents inside the product use Groq models.

## Acknowledgements

FalkorDB, Groq, WeMakeDevs and the Graph Hacks organisers.