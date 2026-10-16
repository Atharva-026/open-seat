import { asyncHandler } from '../utils/asyncHandler.js';
import * as memoryService from '../services/memory.service.js';

export const getMemory = asyncHandler(async (req, res) => {
  res.json(await memoryService.listMemory(req.user.githubLogin));
});

export const putPreference = asyncHandler(async (req, res) => {
  await memoryService.savePreference(req.user.githubLogin, req.params.key, req.body?.value);
  res.status(204).end();
});

export const deletePreference = asyncHandler(async (req, res) => {
  await memoryService.forgetPreference(req.user.githubLogin, req.params.key);
  res.status(204).end();
});

export const deleteMemory = asyncHandler(async (req, res) => {
  await memoryService.forgetEverything(req.user.githubLogin);
  res.status(204).end();
});