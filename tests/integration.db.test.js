import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { createApp } from "../app.js";
import { closeDB, connectDB } from "../config/db.js";

const runDbTests = process.env.RUN_DB_TESTS === "1";
const testRunId = `db-int-${Date.now()}`;
let server;
let baseUrl;
let projectsCollection;
let publishedProjectId;
let draftProjectId;

before(async () => {
  if (!runDbTests) return;

  const db = await connectDB();
  projectsCollection = db.collection("projects");

  const app = createApp();
  await new Promise((resolve, reject) => {
    server = app.listen(0, () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
    server.on("error", reject);
  });

  const insertResult = await projectsCollection.insertMany([
    {
      title: "DB Test Published",
      description: "Published item for DB integration test",
      techStack: ["Node.js"],
      status: "PUBLISHED",
      createdAt: new Date(),
      updatedAt: new Date(),
      testRunId,
    },
    {
      title: "DB Test Draft",
      description: "Draft item for DB integration test",
      techStack: ["MongoDB"],
      status: "DRAFT",
      createdAt: new Date(),
      updatedAt: new Date(),
      testRunId,
    },
  ]);

  publishedProjectId = insertResult.insertedIds["0"];
  draftProjectId = insertResult.insertedIds["1"];
});

after(async () => {
  if (!runDbTests) return;

  if (projectsCollection) {
    await projectsCollection.deleteMany({ testRunId });
  }

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  await closeDB();
});

test(
  "GET /projects/public returns published projects from database",
  { skip: !runDbTests },
  async () => {
    const res = await fetch(`${baseUrl}/projects/public`);
    const payload = await res.json();

    assert.equal(res.status, 200);
    assert.equal(payload.success, true);
    assert.ok(Array.isArray(payload.data));

    const hasPublished = payload.data.some((project) => project.id === publishedProjectId.toString());
    const hasDraft = payload.data.some((project) => project.id === draftProjectId.toString());

    assert.equal(hasPublished, true);
    assert.equal(hasDraft, false);
  }
);

test(
  "GET /projects/public/:id returns details for published project and rejects draft",
  { skip: !runDbTests },
  async () => {
    const publishedRes = await fetch(`${baseUrl}/projects/public/${publishedProjectId}`);
    const publishedPayload = await publishedRes.json();

    assert.equal(publishedRes.status, 200);
    assert.equal(publishedPayload.success, true);
    assert.equal(publishedPayload.data.id, publishedProjectId.toString());

    const draftRes = await fetch(`${baseUrl}/projects/public/${draftProjectId}`);
    const draftPayload = await draftRes.json();

    assert.equal(draftRes.status, 404);
    assert.equal(draftPayload.message, "Project not found");
  }
);

test(
  "GET /projects/public/:id rejects malformed object id",
  { skip: !runDbTests },
  async () => {
    const malformedId = new ObjectId().toString().slice(0, 20);
    const res = await fetch(`${baseUrl}/projects/public/${malformedId}`);
    const payload = await res.json();

    assert.equal(res.status, 400);
    assert.equal(payload.message, "Invalid project id");
  }
);
