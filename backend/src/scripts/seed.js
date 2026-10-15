import { generateCommunity } from '../seed/generateCommunity.js';
import * as seedRepository from '../repositories/seed.repository.js';
import { closeClient } from '../db/client.js';

const { people, teams, pairs } = generateCommunity();

await seedRepository.clearDemoData();
await seedRepository.insertPeople(people);
await seedRepository.insertSkills(people);
await seedRepository.insertTeams(teams);
await seedRepository.insertTeamedWith(pairs);

console.log(`Seeded ${people.length} demo people, ${teams.length} teams, ${pairs.length} teammate links.`);
await closeClient();