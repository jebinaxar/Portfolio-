import test from "node:test";
import assert from "node:assert/strict";
import {
  isValidEmail,
  validateAndNormalizeContactPayload,
} from "../services/contact.service.js";

test("isValidEmail accepts valid emails and rejects malformed values", () => {
  assert.equal(isValidEmail("user@example.com"), true);
  assert.equal(isValidEmail("bad-email"), false);
  assert.equal(isValidEmail("missing@domain"), false);
});

test("validateAndNormalizeContactPayload rejects missing fields", () => {
  const result = validateAndNormalizeContactPayload({
    name: "Jane",
    email: "",
    message: "Hello",
  });

  assert.equal(result.ok, false);
  assert.equal(result.statusCode, 400);
});

test("validateAndNormalizeContactPayload rejects invalid email", () => {
  const result = validateAndNormalizeContactPayload({
    name: "Jane",
    email: "not-an-email",
    message: "Hello",
  });

  assert.equal(result.ok, false);
  assert.equal(result.statusCode, 400);
  assert.equal(result.message, "Please provide a valid email");
});

test("validateAndNormalizeContactPayload handles honeypot submissions", () => {
  const result = validateAndNormalizeContactPayload({
    name: "Bot",
    email: "bot@example.com",
    message: "spam",
    website: "https://spam.example.com",
  });

  assert.equal(result.ok, false);
  assert.equal(result.statusCode, 202);
  assert.equal(result.honeypotTriggered, true);
});

test("validateAndNormalizeContactPayload returns normalized payload", () => {
  const result = validateAndNormalizeContactPayload({
    name: "  Jane  ",
    email: "  Jane@Example.com  ",
    message: "  Hello there  ",
  });

  assert.equal(result.ok, true);
  assert.equal(result.payload.name, "Jane");
  assert.equal(result.payload.email, "jane@example.com");
  assert.equal(result.payload.message, "Hello there");
  assert.equal(result.payload.status, "new");
  assert.ok(result.payload.createdAt instanceof Date);
});
