import { env, assertEnv } from './config/env.js';
import { createApp } from './app.js';
import { closeClient } from './db/client.js';
import { registerMemoryAgent } from './agents/memory/memory.agent.js';

assertEnv();
registerMemoryAgent();

const server = createApp().listen(env.port, () => {
  console.log(`Open Seat API running on http://localhost:${env.port}`);
});

process.on('SIGINT', async () => {
  server.close();
  await closeClient();
  process.exit(0);
});