import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { COOKIES } from '../config/constants.js';
import { HttpError } from '../utils/httpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildAuthorizeUrl, exchangeCodeForToken } from '../services/github.service.js';
import { syncProfileFromGithub } from '../services/profile.service.js';

const cookieBase = { httpOnly: true, sameSite: 'lax', signed: true };

export function startLogin(req, res) {
  const state = crypto.randomBytes(16).toString('hex');
  res.cookie(COOKIES.oauthState, state, { ...cookieBase, maxAge: 10 * 60 * 1000 });
  res.redirect(buildAuthorizeUrl(state));
}

export const handleCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  if (!code || state !== req.signedCookies[COOKIES.oauthState]) {
    throw new HttpError(400, 'Invalid sign-in state');
  }
  res.clearCookie(COOKIES.oauthState);

  const token = await exchangeCodeForToken(code);
  const githubLogin = await syncProfileFromGithub(token);

  res.cookie(COOKIES.session, githubLogin, { ...cookieBase, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.redirect(`${env.frontendUrl}/app/find`);
});

export function logout(req, res) {
  res.clearCookie(COOKIES.session);
  res.status(204).end();
}