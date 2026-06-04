import assert from "node:assert/strict";
import test from "node:test";
import { parseOptions } from "../src/options.js";
import { resolveTheme } from "../src/themes.js";

test("resolves radical theme colors", () => {
  const theme = resolveTheme(parseOptions("user=zients&theme=radical"));
  assert.equal(theme.background, "#141321");
  assert.equal(theme.border, "#E4E2E2");
  assert.equal(theme.ring, "#FE428E");
  assert.equal(theme.fire, "#FE428E");
  assert.equal(theme.currentStreakNumber, "#F8D847");
  assert.equal(theme.dateText, "#A9FEF7");
});

test("option color overrides theme", () => {
  const theme = resolveTheme(parseOptions("user=zients&theme=radical&ring=123456&fire=abcdef"));
  assert.equal(theme.ring, "#123456");
  assert.equal(theme.fire, "#abcdef");
});

test("hide border makes border transparent", () => {
  const theme = resolveTheme(parseOptions("user=zients&theme=radical&hide_border=true"));
  assert.equal(theme.border, "transparent");
});

test("unknown theme falls back to default", () => {
  const theme = resolveTheme(parseOptions("user=zients&theme=missing"));
  assert.equal(theme.background, "#FFFFFF");
  assert.equal(theme.ring, "#00E676");
  assert.equal(theme.currentStreakNumber, "#151515");
});

test("inherited theme keys fall back to default", () => {
  const theme = resolveTheme(parseOptions("user=zients&theme=toString"));
  assert.equal(theme.background, "#FFFFFF");
  assert.equal(theme.ring, "#00E676");
  assert.equal(theme.currentStreakNumber, "#151515");
});

test("passes through special color values", () => {
  const theme = resolveTheme(parseOptions(JSON.stringify({
    user: "zients",
    background: "transparent",
    border: "url(#border-gradient)",
    ring: "rgb(1,2,3)",
    fire: "#abcdef",
  })));

  assert.equal(theme.background, "transparent");
  assert.equal(theme.border, "url(#border-gradient)");
  assert.equal(theme.ring, "rgb(1,2,3)");
  assert.equal(theme.fire, "#abcdef");
});
