import crypto from 'node:crypto';

// Demo personas reply on their own, deterministically. Roughly one in five declines.
export function demoWouldAccept(login, key) {
  const byte = crypto.createHash('sha1').update(`${login}:${key}`).digest()[0];
  return byte % 5 !== 0;
}