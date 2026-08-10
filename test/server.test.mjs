import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const port = 4197;
let child;

test.before(async () => {
  child = spawn(process.execPath, ["server.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "inherit"]
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Server start timed out")), 3000);
    child.once("error", reject);
    child.stdout.once("data", () => { clearTimeout(timeout); resolve(); });
  });
});

test.after(async () => {
  if (!child || child.exitCode !== null) return;
  child.kill("SIGTERM");
  await new Promise((resolve) => child.once("exit", resolve));
});

test("health endpoint reports a live deployment", async () => {
  const response = await fetch(`http://127.0.0.1:${port}/health/live`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("website entry point is served", async () => {
  const response = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /ExamFlow · TOS & TQ Workspace/);
});

test("path traversal is rejected", async () => {
  const response = await fetch(`http://127.0.0.1:${port}/..%2Fpackage.json`);
  assert.equal(response.status, 404);
});
