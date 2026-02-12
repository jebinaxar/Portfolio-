import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../app.js";

const startTestServer = async () => {
  const app = createApp();

  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const address = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`,
      });
    });

    server.on("error", reject);
  });
};

const stopTestServer = async (server) => {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
};

test("GET / responds with health check message", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/`);
    const text = await res.text();
    assert.equal(res.status, 200);
    assert.equal(text, "Server is running");
  } finally {
    await stopTestServer(server);
  }
});

test("GET /auth/me rejects unauthenticated requests", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/auth/me`);
    const payload = await res.json();
    assert.equal(res.status, 401);
    assert.equal(payload.message, "Unauthorized");
  } finally {
    await stopTestServer(server);
  }
});

test("POST /contacts rejects invalid payload", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "A", email: "bad-email", message: "Hello" }),
    });
    const payload = await res.json();
    assert.equal(res.status, 400);
    assert.equal(payload.message, "Please provide a valid email");
  } finally {
    await stopTestServer(server);
  }
});

test("POST /contacts accepts honeypot payload and short-circuits", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Spam Bot",
        email: "spam@example.com",
        message: "Click link",
        website: "https://spam.example.com",
      }),
    });
    const payload = await res.json();
    assert.equal(res.status, 202);
    assert.equal(payload.message, "Contact request submitted");
  } finally {
    await stopTestServer(server);
  }
});

test("unmatched route returns 404 JSON", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/missing-endpoint`);
    const payload = await res.json();
    assert.equal(res.status, 404);
    assert.match(payload.message, /Route not found/);
  } finally {
    await stopTestServer(server);
  }
});
