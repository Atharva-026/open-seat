import Groq from 'groq-sdk';
import { env } from '../config/env.js';

const groq = new Groq({ apiKey: env.groqApiKey });
const models = await groq.models.list();

console.log(models.data.map((m) => m.id).sort().join('\n'));