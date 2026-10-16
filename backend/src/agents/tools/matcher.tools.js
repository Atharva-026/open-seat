import * as skillRepository from '../../repositories/skill.repository.js';
import * as personRepository from '../../repositories/person.repository.js';
import { findTeammates } from '../../services/match.service.js';
import { getProfile } from '../../services/profile.service.js';

const isStringList = (v) => Array.isArray(v) && v.every((s) => typeof s === 'string');

const listSkills = {
  definition: {
    type: 'function',
    function: {
      name: 'list_skills',
      description: 'List every skill name known to the graph. Call this first to map roles like "designer" to exact skill names.',
      parameters: { type: 'object', properties: {} },
    },
  },
  async run() {
    const skills = await skillRepository.listSkills();
    return { data: skills, summary: `Read ${skills.length} skills from the graph` };
  },
};

const getMyProfile = {
  definition: {
    type: 'function',
    function: {
      name: 'get_my_profile',
      description: "Get the signed-in user's own skills and their levels.",
      parameters: { type: 'object', properties: {} },
    },
  },
  async run(_args, ctx) {
    const profile = await getProfile(ctx.me);
    const skills = (profile?.skills ?? []).map((s) => `${s.name} L${s.level}`);
    return { data: { name: profile?.name, skills }, summary: `Read your profile (${skills.length} skills)` };
  },
};

const findTeammatesTool = {
  definition: {
    type: 'function',
    function: {
      name: 'find_teammates',
      description:
        'Find people who fill the skill gaps of the user\'s team. Subtracts skills the user and their current teammates already have, then ranks candidates with evidence, past collaboration and warm intros.',
      parameters: {
        type: 'object',
        properties: {
          needed: { type: 'array', items: { type: 'string' }, description: 'Exact skill names from list_skills that the team needs.' },
          teammates: { type: 'array', items: { type: 'string' }, description: 'GitHub logins of people already on the team, if the user named any.' },
        },
        required: ['needed'],
      },
    },
  },
  async run(args, ctx) {
    if (!isStringList(args.needed) || !args.needed.length || args.needed.length > 10) {
      return { data: { error: '"needed" must be 1 to 10 skill names' }, summary: 'Rejected invalid skill list' };
    }
    const teammates = isStringList(args.teammates) ? args.teammates : [];
    const result = await findTeammates({ me: ctx.me, needed: args.needed, teammates, limit: 6 });
    ctx.lastMatch = result;

    const data = {
      gap: result.gap,
      alreadyCovered: result.alreadyCovered,
      unknownSkills: result.unknown,
      candidates: result.candidates.map((c) => ({
        githubLogin: c.githubLogin,
        name: c.name,
        isDemo: c.isDemo,
        score: c.score,
        covers: c.fills.map((f) => `${f.name} L${f.level}`),
        pastCollaboration: c.history,
        warmIntroVia: c.intro ? c.intro.chain[1].name : null,
        reasons: c.reasons,
      })),
    };
    return { data, summary: `Searched the graph for ${result.gap.join(', ') || 'no gaps'}: ${result.candidates.length} candidates` };
  },
};

const getPastTeammates = {
  definition: {
    type: 'function',
    function: {
      name: 'get_past_teammates',
      description: 'List people the user has teamed with before, with average collaboration rating and times teamed.',
      parameters: { type: 'object', properties: {} },
    },
  },
  async run(_args, ctx) {
    const rows = await personRepository.getPastTeammates(ctx.me);
    return { data: rows, summary: `Found ${rows.length} past teammates` };
  },
};

const tools = [listSkills, getMyProfile, findTeammatesTool, getPastTeammates];

export const definitions = tools.map((t) => t.definition);
const byName = new Map(tools.map((t) => [t.definition.function.name, t]));

// Runs one tool call. Always returns { data, summary }; errors become data the model can read.
export async function executeTool(name, args, ctx) {
  const tool = byName.get(name);
  if (!tool) return { data: { error: `Unknown tool ${name}` }, summary: `Unknown tool ${name}` };
  try {
    return await tool.run(args, ctx);
  } catch (err) {
    console.error(`Tool ${name} failed:`, err.message);
    return { data: { error: 'The tool failed' }, summary: `${name} failed` };
  }
}