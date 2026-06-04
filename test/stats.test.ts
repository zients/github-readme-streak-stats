import assert from "node:assert/strict";
import test from "node:test";
import { calculateStats } from "../src/stats.ts";

const baseOptions = {
  mode: "daily" as const,
  excludeDays: [],
};

test("daily current streak uses yesterday when today has no contributions", () => {
  const stats = calculateStats(
    [
      { date: "2026-06-01", contributionCount: 0 },
      { date: "2026-06-02", contributionCount: 3 },
      { date: "2026-06-03", contributionCount: 2 },
      { date: "2026-06-04", contributionCount: 0 },
    ],
    { ...baseOptions, today: "2026-06-04" },
  );
  assert.equal(stats.totalContributions, 5);
  assert.equal(stats.currentStreak.length, 2);
  assert.equal(stats.currentStreak.start, "2026-06-02");
  assert.equal(stats.currentStreak.end, "2026-06-03");
  assert.equal(stats.longestStreak.length, 2);
});

test("daily stats normalize duplicate dates and unsorted input", () => {
  const stats = calculateStats(
    [
      { date: "2026-06-03", contributionCount: 1 },
      { date: "2026-06-02", contributionCount: 2 },
      { date: "2026-06-01", contributionCount: 0 },
      { date: "2026-06-02", contributionCount: 3 },
    ],
    { ...baseOptions, today: "2026-06-03" },
  );
  assert.equal(stats.totalContributions, 6);
  assert.equal(stats.firstContribution, "2026-06-02");
  assert.equal(stats.currentStreak.length, 2);
  assert.equal(stats.currentStreak.start, "2026-06-02");
  assert.equal(stats.currentStreak.end, "2026-06-03");
  assert.equal(stats.longestStreak.length, 2);
});

test("daily current streak includes today when active", () => {
  const stats = calculateStats(
    [
      { date: "2026-06-02", contributionCount: 3 },
      { date: "2026-06-03", contributionCount: 2 },
      { date: "2026-06-04", contributionCount: 1 },
    ],
    { ...baseOptions, today: "2026-06-04" },
  );
  assert.equal(stats.currentStreak.length, 3);
  assert.equal(stats.currentStreak.end, "2026-06-04");
  assert.equal(stats.longestStreak.length, 3);
});

test("empty input returns empty stats", () => {
  const stats = calculateStats([], { ...baseOptions, today: "2026-06-04" });
  assert.equal(stats.totalContributions, 0);
  assert.equal(stats.firstContribution, "");
  assert.equal(stats.currentStreak.length, 0);
  assert.equal(stats.longestStreak.length, 0);
});

test("all-inactive input returns no first contribution or streaks", () => {
  const stats = calculateStats(
    [
      { date: "2026-06-01", contributionCount: 0 },
      { date: "2026-06-02", contributionCount: 0 },
      { date: "2026-06-03", contributionCount: 0 },
    ],
    { ...baseOptions, today: "2026-06-03" },
  );
  assert.equal(stats.firstContribution, "");
  assert.equal(stats.currentStreak.length, 0);
  assert.equal(stats.longestStreak.length, 0);
});

test("daily longest streak resets across missing calendar dates", () => {
  const stats = calculateStats(
    [
      { date: "2026-06-01", contributionCount: 1 },
      { date: "2026-06-03", contributionCount: 1 },
    ],
    { ...baseOptions, today: "2026-06-03" },
  );
  assert.equal(stats.longestStreak.length, 1);
});

test("excluded days do not break an active streak", () => {
  const stats = calculateStats(
    [
      { date: "2026-06-05", contributionCount: 1 },
      { date: "2026-06-06", contributionCount: 0 },
      { date: "2026-06-07", contributionCount: 0 },
      { date: "2026-06-08", contributionCount: 1 },
    ],
    { mode: "daily", excludeDays: ["Sat", "Sun"], today: "2026-06-08" },
  );
  assert.equal(stats.currentStreak.length, 4);
});

test("weekly mode counts active weeks", () => {
  const stats = calculateStats(
    [
      { date: "2026-05-31", contributionCount: 1 },
      { date: "2026-06-07", contributionCount: 2 },
      { date: "2026-06-14", contributionCount: 0 },
    ],
    { mode: "weekly", excludeDays: [], today: "2026-06-14" },
  );
  assert.equal(stats.currentStreak.length, 2);
  assert.equal(stats.longestStreak.length, 2);
  assert.equal(stats.totalContributions, 3);
});

test("weekly missing week breaks streaks", () => {
  const stats = calculateStats(
    [
      { date: "2026-05-31", contributionCount: 1 },
      { date: "2026-06-14", contributionCount: 2 },
    ],
    { mode: "weekly", excludeDays: [], today: "2026-06-14" },
  );
  assert.equal(stats.currentStreak.length, 1);
  assert.equal(stats.currentStreak.start, "2026-06-14");
  assert.equal(stats.longestStreak.length, 1);
});
