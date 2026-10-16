import Groq from 'groq-sdk';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

let client;
const getClient = () => (client ??= new Groq({ apiKey: env.groqApiKey }));

const modelsToTry = () => [env.groqModel, env.groqFallbackModel].filter(Boolean);
const RETRY_WITH_NEXT_MODEL = new Set([404, 429]);

// Returns the assistant message: either an answer or a list of tool calls.
export async function complete({ messages, tools }) {
  let lastError;

  for (const model of modelsToTry()) {
    try {
      const res = await getClient().chat.completions.create({
        model,
        messages,
        tools,
        tool_choice: 'auto',
        temperature: 0.2,
      });
      return res.choices[0].message;
    } catch (err) {
      lastError = err;
      if (!RETRY_WITH_NEXT_MODEL.has(err.status)) break;
      console.warn(`Model "${model}" unavailable (${err.status}), trying the next one.`);
    }
  }

  if (lastError?.status === 429) {
    throw new HttpError(429, 'The AI service is busy. Please try again in a moment.');
  }
  console.error('LLM request failed:', lastError?.status, lastError?.message);
  throw new HttpError(502, 'The AI service is unavailable.');
}