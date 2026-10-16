import crypto from 'node:crypto';
import { HttpError } from '../utils/httpError.js';
import * as memoryRepository from '../repositories/memory.repository.js';

const EPISODES_KEPT = 20;
const EPISODES_SHOWN = 5;
const PATTERNS_SHOWN = 5;

const VALIDATORS = {
  availability: (v) => ['full-time', 'evenings', 'weekends'].includes(v),
  timezone: (v) => /^UTC[+-]\d{1,2}(:\d{2})?$/.test(v),
  notes: (v) => v.length > 0 && v.length <= 140,
};
export const PREFERENCE_KEYS = Object.keys(VALIDATORS);

export async function savePreference(me, key, value) {
  if (!PREFERENCE_KEYS.includes(key) || typeof value !== 'string' || !VALIDATORS[key](value.trim())) {
    throw new HttpError(400, `Invalid value for "${key}"`);
  }
  await memoryRepository.upsertPreference(me, key, value.trim());
}

export async function forgetPreference(me, key) {
  if (!PREFERENCE_KEYS.includes(key)) throw new HttpError(400, 'Unknown preference');
  await memoryRepository.deletePreference(me, key);
}

export const forgetEverything = (me) => memoryRepository.deleteEverything(me);

export async function listMemory(me) {
  const [preferences, episodes, patterns] = await Promise.all([
    memoryRepository.getPreferences(me),
    memoryRepository.getRecentEpisodes(me, EPISODES_SHOWN),
    memoryRepository.getPatterns(me, PATTERNS_SHOWN),
  ]);
  return {
    preferences,
    episodes,
    patterns: patterns.map((p) => ({
      key: p.key,
      categories: p.categories,
      count: p.count,
      average: Math.round((p.ratingSum / p.count) * 10) / 10,
    })),
  };
}

export async function getPreferenceMap(me) {
  const preferences = await memoryRepository.getPreferences(me);
  return Object.fromEntries(preferences.map((p) => [p.key, p.value]));
}

export const recordEpisode = (me, { question, gap, recommended }) =>
  memoryRepository.addEpisode(
    me,
    { id: crypto.randomUUID(), question, gap, recommended },
    EPISODES_KEPT
  );

export const recordTeamHistory = (me, team) => memoryRepository.addTeamHistory(me, team);

export const markTeamRated = (me, teamId) => memoryRepository.markTeamRated(me, teamId);

// One pattern per skill area a teammate added, so patterns add up across teams.
export async function recordPattern(me, { categories, ratings }) {
  const ratingSum = ratings.reduce((sum, r) => sum + r, 0);
  await Promise.all(
    categories.map((category) =>
      memoryRepository.upsertPattern(me, {
        key: `adds:${category}`,
        categories: [category],
        ratingSum,
        n: ratings.length,
      })
    )
  );
}