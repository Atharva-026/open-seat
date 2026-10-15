import { COOKIES } from '../config/constants.js';
import { HttpError } from '../utils/httpError.js';

export function requireAuth(req, res, next) {
  const githubLogin = req.signedCookies[COOKIES.session];
  if (!githubLogin) throw new HttpError(401, 'Not signed in');
  req.user = { githubLogin };
  next();
}
