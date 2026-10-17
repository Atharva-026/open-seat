import { complete } from '../llm.client.js';
import { definitions, executeTool } from '../tools/matcher.tools.js';
import { buildSystemPrompt } from './matcher.prompt.js';
import { toPlainText } from '../../utils/plainText.js';
import * as memoryService from '../../services/memory.service.js';

const MAX_STEPS = 6;
const RECOMMENDED_SHOWN = 3;

function parseArgs(raw) {
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

const SEAT_PATTERN = /^Seat \d+ of \d+:/;
const TEAM_PATTERN = /My team so far: (.+?)\.$/;

// Seat messages come from the guided team builder: they search for one person and name the team so far.
function seatContext(message) {
  if (!SEAT_PATTERN.test(message)) return { seatMode: false, teamLogins: [] };
  const listed = message.match(TEAM_PATTERN)?.[1] ?? '';
  const teamLogins = listed === 'just me' ? [] : listed.split(',').map((s) => s.trim()).filter(Boolean);
  return { seatMode: true, teamLogins };
}

export async function runMatcherAgent({ me, message, history = [] }) {
  const memory = await memoryService.listMemory(me);
  const messages = [
    { role: 'system', content: buildSystemPrompt(memory) },
    ...history,
    { role: 'user', content: message },
  ];
  const ctx = { me, lastMatch: null, ...seatContext(message) };
  const steps = [];

  // Builds the response and writes this request to the user's episodic memory.
  const finish = async (answer) => {
    const match = ctx.lastMatch;
    if (match) {
      await memoryService.recordEpisode(me, {
        question: message,
        gap: match.gap,
        recommended: match.candidates.slice(0, RECOMMENDED_SHOWN).map((c) => c.githubLogin),
      });
    }
    return {
      answer: toPlainText(answer),
      steps,
      gap: match?.gap ?? [],
      candidates: match?.candidates ?? [],
    };
  };

  for (let i = 0; i < MAX_STEPS; i++) {
    const reply = await complete({ messages, tools: definitions });

    if (!reply.tool_calls?.length) return finish(reply.content ?? '');

    messages.push({ role: 'assistant', content: reply.content ?? '', tool_calls: reply.tool_calls });

    for (const call of reply.tool_calls) {
      const args = parseArgs(call.function.arguments);
      const { data, summary } = await executeTool(call.function.name, args, ctx);
      steps.push({ tool: call.function.name, input: args, summary });
      messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(data) });
    }
  }

  return finish('I could not finish that request. Try asking for fewer things at once.');
}