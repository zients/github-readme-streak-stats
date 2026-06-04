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
  assert.equal(theme.background, "#FFFEFE");
  assert.equal(theme.ring, "#FB8C00");
  assert.equal(theme.currentStreakNumber, "#151515");
});

test("inherited theme keys fall back to default", () => {
  const theme = resolveTheme(parseOptions("user=zients&theme=toString"));
  assert.equal(theme.background, "#FFFEFE");
  assert.equal(theme.ring, "#FB8C00");
  assert.equal(theme.currentStreakNumber, "#151515");
});

test("default theme is synced to upstream colors", () => {
  const theme = resolveTheme(parseOptions("user=zients&theme=default"));
  assert.equal(theme.background, "#FFFEFE");
  assert.equal(theme.ring, "#FB8C00");
  assert.equal(theme.fire, "#FB8C00");
  assert.equal(theme.currentStreakLabel, "#FB8C00");
  assert.equal(theme.dateText, "#464646");
});

test("resolves added curated themes", () => {
  const dracula = resolveTheme(parseOptions("user=zients&theme=dracula"));
  assert.equal(dracula.background, "#282A36");
  assert.equal(dracula.ring, "#FF6E96");
  assert.equal(dracula.currentStreakNumber, "#79DAFA");

  const tokyo = resolveTheme(parseOptions("user=zients&theme=tokyonight"));
  assert.equal(tokyo.background, "#1A1B27");
  assert.equal(tokyo.dateText, "#38BDAE");
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
