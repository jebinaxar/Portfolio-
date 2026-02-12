import test from "node:test";
import assert from "node:assert/strict";
import { createMemoryRateLimiter } from "../middleware/rateLimit.middleware.js";

const makeRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

test("rate limiter allows requests within configured limit", () => {
  const limiter = createMemoryRateLimiter({ windowMs: 60_000, maxRequests: 2 });
  const req = { ip: "127.0.0.10" };
  const res = makeRes();
  let nextCalls = 0;

  limiter(req, res, () => {
    nextCalls += 1;
  });
  limiter(req, res, () => {
    nextCalls += 1;
  });

  assert.equal(nextCalls, 2);
  assert.equal(res.statusCode, 200);
});

test("rate limiter blocks requests over configured limit", () => {
  const limiter = createMemoryRateLimiter({
    windowMs: 60_000,
    maxRequests: 1,
    message: "Limited",
  });
  const req = { ip: "127.0.0.11" };
  const res = makeRes();
  let nextCalls = 0;

  limiter(req, res, () => {
    nextCalls += 1;
  });
  limiter(req, res, () => {
    nextCalls += 1;
  });

  assert.equal(nextCalls, 1);
  assert.equal(res.statusCode, 429);
  assert.deepEqual(res.body, { message: "Limited" });
});
