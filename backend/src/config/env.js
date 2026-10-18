import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(dirname, '../../../.env') });

export const env = {
  port: Number(process.env.PORT ?? 3001),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  falkordb: {
    host: process.env.FALKORDB_HOST ?? 'localhost',
    port: Number(process.env.FALKORDB_PORT ?? 6379),
    username: process.env.FALKORDB_USERNAME || undefined,
    password: process.env.FALKORDB_PASSWORD || undefined,
    tls: process.env.FALKORDB_TLS === 'true',
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackUrl: process.env.GITHUB_CALLBACK_URL ?? 'http://localhost:3001/auth/github/callback',
  },
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b',
  groqFallbackModel: process.env.GROQ_FALLBACK_MODEL,
  sessionSecret: process.env.SESSION_SECRET,
  isProduction: process.env.NODE_ENV === 'production',
};

// Call once at server startup so a missing key fails loudly, not mid-request.
export function assertEnv() {
  const missing = [
    ['GITHUB_CLIENT_ID', env.github.clientId],
    ['GITHUB_CLIENT_SECRET', env.github.clientSecret],
    ['GROQ_API_KEY', env.groqApiKey],
    ['SESSION_SECRET', env.sessionSecret],
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}
