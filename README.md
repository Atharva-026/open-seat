# Open Seat

**Find the teammate who fills the gap.** Open Seat is an AI agent that builds hackathon teams around skill gaps, remembers who worked well together, and shows the graph path behind every suggestion.

Built for **Graph Hacks** (WeMakeDevs x FalkorDB), track: **Agent Memory and Coordination**. FalkorDB is the context layer for every agent.

- Live demo: [URL, or delete this line]
- Demo video: [URL]
- Blog post: [URL]

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

```cypher
// Candidates for a skill gap, with past collaboration ratings
MATCH (c:Person)-[h:HAS_SKILL]->(s:Skill)
WHERE s.name IN $gap AND NOT c.githubLogin IN $team
WITH c, collect({name: s.name, level: h.level, evidence: h.evidence}) AS fills
OPTIONAL MATCH (m:Person)-[t:TEAMED_WITH]-(c) WHERE m.githubLogin IN $team
RETURN c, fills, avg(t.rating) AS history, count(t) AS timesTeamed

// Warm introductions through a mutual teammate
MATCH (a:Person)-[t1:TEAMED_WITH]-(mid:Person)-[t2:TEAMED_WITH]-(b:Person)
WHERE a.githubLogin IN $team AND b.githubLogin IN $candidates
  AND NOT mid.githubLogin IN $team AND t1.rating >= 3 AND t2.rating >= 3
RETURN a, mid, b, t1.rating, t2.rating
```

## Agents

- **Profiler:** GitHub OAuth, then repository languages, topics and `package.json` / `requirements.txt` dependencies become skills with evidence.
- **Matcher** (Groq, tool calling): `list_skills`, `get_my_profile`, `get_profile_gaps`, `find_teammates`, `get_past_teammates`, `remember_preference`. It can ask a clarifying question, and every step it takes is shown in the UI.
- **Outreach:** drafts a personalised invitation (AI-written, with a template fallback), sends it, tracks replies, and confirms or closes the team.
- **Memory:** on `team.confirmed` it writes the team to each real member's private graph. On `feedback.submitted` it records which skill areas your teammates added and how you rated them.

Ranking: 60% gap coverage, 30% skill strength, 10% past collaboration, plus a small bonus for remembered preferences and for strong warm introductions.

## Real data and demo data

- **Real:** people who sign in with GitHub. Only public repositories are read. The GitHub token is used once and never stored.
- **Demo:** 40 synthetic personas (`backend/src/seed`, fixed random seed), 3 fictional past hackathons, and their ratings. They are marked `isDemo`, labelled "demo persona" in the UI, and their invitation replies are **simulated** and labelled so.

## Run it locally

Requirements: Node 22, Docker, a GitHub OAuth app, a Groq API key.

```bash
git clone https://github.com/Atharva-026/open-seat.git
cd open-seat
docker compose up -d                  # FalkorDB on 6379, browser on 3000
cp .env.example .env                  # then fill in the values
cd backend && npm install && npm run seed && cd ..
cd frontend && npm install && cd ..
npm install && npm run dev            # backend :3001, frontend :5173
```

Create a GitHub OAuth app with homepage `http://localhost:5173` and callback `http://localhost:3001/auth/github/callback`, and put its client ID and secret in `.env`.

| Variable | Purpose |
|---|---|
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL` | GitHub sign-in |
| `SESSION_SECRET` | signs the session cookie |
| `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_FALLBACK_MODEL` | the agents' language model |
| `FALKORDB_HOST`, `FALKORDB_PORT` | database connection |
| `PORT`, `FRONTEND_URL` | server settings |

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
- [Add: profile deletion from the shared graph, if you build it before submitting.]

## Known limitations

- Demo personas reply automatically, so invitation flows with real people need a second signed-in account.
- The Groq free tier is rate limited; the app falls back to a second model.
- Agents hand off through an in-process event bus, so run a single server instance.
- Skill evidence comes from profile repositories, not commit statistics.
- [Add anything else that is honest, for example features you did not finish.]

## How AI tools were used

[Edit this so it is true. For example: "I used Claude as a coding and design assistant while building this project. I chose the idea, the architecture and the data model, ran and tested every feature, and can explain the code. The agents inside the product use Groq models."]

## Acknowledgements

FalkorDB, Groq, WeMakeDevs and the Graph Hacks organisers.