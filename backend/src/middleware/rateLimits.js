import { rateLimit } from 'express-rate-limit';

const make = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
  });

// The AI matcher spends your Groq quota, so it gets the tightest limit.
export const matcherLimiter = make(10 * 60 * 1000, 20, 'Too many searches. Please try again in a few minutes.');

// Creating teams and sending invites.
export const writeLimiter = make(15 * 60 * 1000, 40, 'Too many requests. Please slow down and try again shortly.');