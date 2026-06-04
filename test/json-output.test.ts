import assert from "node:assert/strict";
import test from "node:test";
import { buildJson } from "../src/json-output.js";
import { parseOptions } from "../src/options.js";

const stats = {
  totalContributions: 1234,
  firstContribution: "2020-04-14",
  currentStreak: { start: "2024-03-01", end: "2024-04-21", length: 52 },
  longestStreak: { start: "2022-05-11", end: "2022-08-05", length: 86 },
  mode: "daily" as const,
};

test("buildJson serializes stats and excluded days", () => {
  const options = parseOptions("user=zients&exclude_days=Sat,Sun");
  assert.deepEqual(buildJson(stats, options), {
    user: "zients",
    mode: "daily",
    totalContributions: 1234,
    firstContribution: "2020-04-14",
    currentStreak: { start: "2024-03-01", end: "2024-04-21", length: 52 },
    longestStreak: { start: "2022-05-11", end: "2022-08-05", length: 86 },
    excludedDays: ["Sat", "Sun"],
  });
});
