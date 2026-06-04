import assert from "node:assert/strict";
import test from "node:test";
import { parseOptions } from "../src/options.js";
import { resolveTheme } from "../src/themes.js";
import { renderSvg } from "../src/render-svg.js";

const stats = {
  totalContributions: 1251,
  firstContribution: "2019-07-19",
  currentStreak: { start: "2026-05-22", end: "2026-06-04", length: 14 },
  longestStreak: { start: "2026-05-22", end: "2026-06-04", length: 14 },
  mode: "daily" as const,
};

test("renders radical three-column SVG", () => {
  const options = parseOptions("user=zients&theme=radical&disable_animations=true");
  const svg = renderSvg({ options, theme: resolveTheme(options), stats });
  assert.match(svg, /viewBox='0 0 495 195'/);
  assert.match(svg, /Total Contributions/);
  assert.match(svg, /Current Streak/);
  assert.match(svg, /Longest Streak/);
  assert.match(svg, /#141321/);
  assert.match(svg, /#FE428E/);
  assert.match(svg, />\s*14\s*</);
});

test("uses Denver-style default card coordinates", () => {
  const options = parseOptions("user=zients&theme=radical");
  const svg = renderSvg({ options, theme: resolveTheme(options), stats });

  assert.match(svg, /<line x1='165' y1='28' x2='165' y2='170'/);
  assert.match(svg, /<text x='82\.5' y='80'[^>]*>1,251<\/text>/);
  assert.match(svg, /<text x='82\.5' y='116'[^>]*>Total Contributions<\/text>/);
  assert.match(svg, /<text x='82\.5' y='146'[^>]*>Since Jul 19, 2019<\/text>/);
  assert.match(svg, /<circle cx='247\.5' cy='71' r='40'[^>]*mask='url\(#streak-ring-mask\)'/);
  assert.match(svg, /transform='translate\(247\.5 19\.5\) scale\(0\.9\)'/);
  assert.match(svg, /<text x='247\.5' y='80'[^>]*>14<\/text>/);
  assert.match(svg, /<text x='247\.5' y='140'[^>]*>Current Streak<\/text>/);
  assert.match(svg, /<text x='247\.5' y='166'[^>]*>May 22 - Jun 4<\/text>/);
});

test("escapes user-controlled text", () => {
  const options = parseOptions("user=zients&theme=radical");
  const svg = renderSvg({
    options,
    theme: resolveTheme(options),
    stats: { ...stats, firstContribution: "2026-01-01" },
    title: "zien<>&\"'",
  });
  assert.match(svg, /zien&lt;&gt;&amp;&quot;&apos;/);
  assert.doesNotMatch(svg, /zien<>&"'/);
});

test("respects hidden side sections", () => {
  const options = parseOptions("user=zients&hide_total_contributions=true&hide_longest_streak=true");
  const svg = renderSvg({ options, theme: resolveTheme(options), stats });
  assert.doesNotMatch(svg, /Total Contributions/);
  assert.doesNotMatch(svg, /Longest Streak/);
  assert.match(svg, /Current Streak/);
});

test("formats first contribution with configured date format", () => {
  const options = parseOptions("user=zients&date_format=M j[, Y]");
  const svg = renderSvg({ options, theme: resolveTheme(options), stats });
  assert.match(svg, /Since Jul 19, 2019/);
  assert.doesNotMatch(svg, /Since 2019-07-19/);
});

test("respects hidden current streak section", () => {
  const options = parseOptions("user=zients&hide_current_streak=true");
  const svg = renderSvg({ options, theme: resolveTheme(options), stats });
  assert.match(svg, /Total Contributions/);
  assert.doesNotMatch(svg, /Current Streak/);
  assert.match(svg, /Longest Streak/);
});
