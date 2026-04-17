import test from "node:test";
import assert from "node:assert/strict";
import {
  canTransitionProjectStatus,
  PROJECT_STATUS,
} from "../services/projectWorkflow.service.js";

test("allows moving between distinct known project statuses", () => {
  assert.equal(
    canTransitionProjectStatus(PROJECT_STATUS.DRAFT, PROJECT_STATUS.REVIEW),
    true
  );
  assert.equal(
    canTransitionProjectStatus(PROJECT_STATUS.REVIEW, PROJECT_STATUS.PUBLISHED),
    true
  );
  assert.equal(
    canTransitionProjectStatus(PROJECT_STATUS.PUBLISHED, PROJECT_STATUS.DRAFT),
    true
  );
  assert.equal(
    canTransitionProjectStatus(PROJECT_STATUS.ARCHIVED, PROJECT_STATUS.REVIEW),
    true
  );
});

test("rejects same-status and unknown-status transitions", () => {
  assert.equal(
    canTransitionProjectStatus(PROJECT_STATUS.DRAFT, PROJECT_STATUS.DRAFT),
    false
  );
  assert.equal(
    canTransitionProjectStatus(PROJECT_STATUS.REVIEW, "INVALID"),
    false
  );
  assert.equal(
    canTransitionProjectStatus("INVALID", PROJECT_STATUS.PUBLISHED),
    false
  );
});
