import { complete } from '../llm.client.js';
import { definitions, executeTool } from '../tools/matcher.tools.js';
import { MATCHER_SYSTEM_PROMPT } from './matcher.prompt.js';

const MAX_STEPS = 6;

function parseArgs(raw) {
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

export async function runMatcherAgent({ me, message }) {
  const messages = [
    { role: 'system', content: MATCHER_SYSTEM_PROMPT },
    { role: 'user', content: message },
  ];
  const ctx = { me, lastMatch: null };
  const steps = [];

  for (let i = 0; i < MAX_STEPS; i++) {
    const reply = await complete({ messages, tools: definitions });

    if (!reply.tool_calls?.length) {
      return {
        answer: reply.content ?? '',
        steps,
        gap: ctx.lastMatch?.gap ?? [],
        candidates: ctx.lastMatch?.candidates ?? [],
      };
    }

    messages.push({ role: 'assistant', content: reply.content ?? '', tool_calls: reply.tool_calls });

    for (const call of reply.tool_calls) {
      const args = parseArgs(call.function.arguments);
      const { data, summary } = await executeTool(call.function.name, args, ctx);
      steps.push({ tool: call.function.name, input: args, summary });
      messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(data) });
    }
  }

  return {
    answer: 'I could not finish that request. Try asking for fewer things at once.',
    steps,
    gap: ctx.lastMatch?.gap ?? [],
    candidates: ctx.lastMatch?.candidates ?? [],
  };
}