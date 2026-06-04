import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { parseOptions } from "../src/options.js";

describe("parseOptions", () => {
  it("parses query-string options", () => {
    const options = parseOptions(
      "user=zients&theme=radical&disable_animations=true&card_width=600",
    );

    assert.equal(options.user, "zients");
    assert.equal(options.theme, "radical");
    assert.equal(options.disableAnimations, true);
    assert.equal(options.cardWidth, 600);
  });

  it("parses JSON options", () => {
    const options = parseOptions(
      JSON.stringify({ user: "zients", theme: "dark", short_numbers: true }),
    );

    assert.equal(options.user, "zients");
    assert.equal(options.theme, "dark");
    assert.equal(options.shortNumbers, true);
  });

  it("applies defaults", () => {
    const options = parseOptions("user=zients");

    assert.equal(options.theme, "default");
    assert.equal(options.mode, "daily");
    assert.equal(options.cardWidth, 495);
    assert.equal(options.cardHeight, 195);
    assert.equal(options.borderRadius, 4.5);
  });

  it("rejects non-svg output type", () => {
    assert.throws(
      () => parseOptions("user=zients&type=png"),
      /only supports SVG output/i,
    );
  });

  it("normalizes hidden section booleans and exclude days", () => {
    const options = parseOptions(
      "user=zients&hide_total_contributions=1&exclude_days=Sun, mon, bad",
    );

    assert.equal(options.hideTotalContributions, true);
    assert.deepEqual(options.excludeDays, ["Sun", "Mon"]);
  });

  it("sanitizes users and falls back to the repository owner", () => {
    const previousOwner = process.env.GITHUB_REPOSITORY_OWNER;

    try {
      process.env.GITHUB_REPOSITORY_OWNER = "fallback_owner!";

      assert.equal(parseOptions("user=zien_ts!42").user, "zients42");
      assert.equal(parseOptions("").user, "fallbackowner");
    } finally {
      if (previousOwner === undefined) {
        delete process.env.GITHUB_REPOSITORY_OWNER;
      } else {
        process.env.GITHUB_REPOSITORY_OWNER = previousOwner;
      }
    }
  });

  it("uses weekly mode only for the exact weekly value", () => {
    assert.equal(parseOptions("user=zients&mode=weekly").mode, "weekly");
    assert.equal(parseOptions("user=zients&mode=Weekly").mode, "daily");
    assert.equal(parseOptions("user=zients&mode=monthly").mode, "daily");
  });

  it("falls back for invalid numbers and parses valid numbers", () => {
    const invalid = parseOptions(
      "user=zients&border_radius=0&card_width=-1&card_height=bad&starting_year=NaN",
    );

    assert.equal(invalid.borderRadius, 4.5);
    assert.equal(invalid.cardWidth, 495);
    assert.equal(invalid.cardHeight, 195);
    assert.equal(invalid.startingYear, undefined);

    const valid = parseOptions(
      "user=zients&border_radius=8.25&card_width=600&card_height=220&starting_year=2020",
    );

    assert.equal(valid.borderRadius, 8.25);
    assert.equal(valid.cardWidth, 600);
    assert.equal(valid.cardHeight, 220);
    assert.equal(valid.startingYear, 2020);
  });

  it("parses truthy booleans case-insensitively", () => {
    const options = parseOptions(
      "user=zients&hide_border=YES&hide_current_streak=On&hide_longest_streak=TRUE&disable_animations=1",
    );

    assert.equal(options.hideBorder, true);
    assert.equal(options.hideCurrentStreak, true);
    assert.equal(options.hideLongestStreak, true);
    assert.equal(options.disableAnimations, true);
  });

  it("maps date_format to dateFormat", () => {
    assert.equal(parseOptions("user=zients&date_format=MMMM d, yyyy").dateFormat, "MMMM d, yyyy");
  });

  it("maps color and camelCase text options", () => {
    const options = parseOptions(JSON.stringify({
      user: "zients",
      background: "#fff",
      border: "#111",
      stroke: "#222",
      ring: "#333",
      fire: "#444",
      currStreakNum: "#555",
      sideNums: "#666",
      currStreakLabel: "#777",
      sideLabels: "#888",
      excludeDaysLabel: "#999",
    }));

    assert.equal(options.background, "#fff");
    assert.equal(options.border, "#111");
    assert.equal(options.stroke, "#222");
    assert.equal(options.ring, "#333");
    assert.equal(options.fire, "#444");
    assert.equal(options.currStreakNum, "#555");
    assert.equal(options.sideNums, "#666");
    assert.equal(options.currStreakLabel, "#777");
    assert.equal(options.sideLabels, "#888");
    assert.equal(options.excludeDaysLabel, "#999");
  });

  it("accepts only exact short or full day names for exclude days", () => {
    const options = parseOptions(
      "user=zients&exclude_days=monkey,monday,TUE,tuesdayish,friday,fri",
    );

    assert.deepEqual(options.excludeDays, ["Mon", "Tue", "Fri", "Fri"]);
  });

  it("throws a parser-specific error for malformed JSON options", () => {
    assert.throws(() => parseOptions("{bad json"), /invalid JSON options/i);
  });
});
