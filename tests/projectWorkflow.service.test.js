import test from "node:test";
import assert from "node:assert/strict";
import {
  canTransitionProjectStatus,
  PROJECT_STATUS,
} from "../services/projectWorkflow.service.js";

test("allows valid project lifecycle transitions", () => {
  assert.equal(
    canTransitionProjectStatus(PROJECT_STATUS.DRAFT, PROJECT_STATUS.REVIEW),
    true
  );
  assert.equal(
    canTransitionProjectStatus(PROJECT_STATUS.REVIEW, PROJECT_STATUS.PUBLISHED),
    true
  );
  assert.equal(
    canTransitionProjectStatus(PROJECT_STATUS.PUBLISHED, PROJECT_STATUS.ARCHIVED),
    true
  );
  assert.equal(
    canTransitionProjectStatus(PROJECT_STATUS.ARCHIVED, PROJECT_STATUS.DRAFT),
    true
  );
});

test("rejects invalid project lifecycle transitions", () => {
  assert.equal(
    canTransitionProjectStatus(PROJECT_STATUS.DRAFT, PROJECT_STATUS.PUBLISHED),
    false
  );
  assert.equal(
    canTransitionProjectStatus(PROJECT_STATUS.REVIEW, PROJECT_STATUS.ARCHIVED),
    false
  );
  assert.equal(
    canTransitionProjectStatus(PROJECT_STATUS.ARCHIVED, PROJECT_STATUS.PUBLISHED),
    false
  );
});
