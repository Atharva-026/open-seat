import { generateCommunity } from '../seed/generateCommunity.js';
import { generateBoard } from '../seed/generateBoard.js';
import * as seedRepository from '../repositories/seed.repository.js';
import { closeClient } from '../db/client.js';

const { people } = generateCommunity(); // same fixed seed, so the same demo people
const board = generateBoard(people);

await seedRepository.clearDemoBoard();
await seedRepository.insertBoard(board);

console.log(`Seeded ${board.length} demo teams with one open seat each.`);
await closeClient();