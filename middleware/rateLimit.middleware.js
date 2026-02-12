const buckets = new Map();

export const createMemoryRateLimiter = ({
  windowMs = 60_000,
  maxRequests = 5,
  message = "Too many requests, please try again later.",
}) => {
  return (req, res, next) => {
    const key = req.ip || req.socket?.remoteAddress || "unknown";
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || now > existing.resetAt) {
      buckets.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }

    if (existing.count >= maxRequests) {
      return res.status(429).json({ message });
    }

    existing.count += 1;
    buckets.set(key, existing);
    return next();
  };
};
