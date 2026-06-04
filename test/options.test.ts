import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { parseOptions } from "../src/options.ts";

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
});
