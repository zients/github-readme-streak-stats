import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { writeFileAtomically } from "../src/files.ts";

test("writes file and creates parent directories", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "streak-action-"));
  try {
    const output = path.join(dir, "profile", "streak.svg");
    await writeFileAtomically(output, "<svg/>");
    assert.equal(await readFile(output, "utf8"), "<svg/>");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
