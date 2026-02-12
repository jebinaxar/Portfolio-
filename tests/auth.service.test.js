import test from "node:test";
import assert from "node:assert/strict";
import {
  getNextSessionVersion,
  validateAuthCredentialsInput,
} from "../services/auth.service.js";

test("validateAuthCredentialsInput returns true for valid email/password", () => {
  assert.equal(validateAuthCredentialsInput("admin@example.com", "Secret123!"), true);
});

test("validateAuthCredentialsInput returns false when values are missing", () => {
  assert.equal(validateAuthCredentialsInput("", "Secret123!"), false);
  assert.equal(validateAuthCredentialsInput("admin@example.com", ""), false);
  assert.equal(validateAuthCredentialsInput(null, null), false);
});

test("getNextSessionVersion increments existing version", () => {
  assert.equal(getNextSessionVersion(2), 3);
});

test("getNextSessionVersion initializes from default when value missing", () => {
  assert.equal(getNextSessionVersion(undefined), 2);
});
