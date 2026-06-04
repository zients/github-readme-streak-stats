import assert from "node:assert/strict";
import test from "node:test";
import { cleanJavaScriptTrailingWhitespace } from "../scripts/clean-dist-whitespace.js";

test("strips trailing whitespace outside JavaScript string contents", () => {
  const input = "const value = 1;  \n// comment\t\nconst next = 2;\n";

  assert.equal(
    cleanJavaScriptTrailingWhitespace(input),
    "const value = 1;\n// comment\nconst next = 2;\n",
  );
});

test("preserves untagged template literal trailing whitespace with escapes", () => {
  const input = "const value = `first  \nsecond\t\n`;  \n";

  assert.equal(
    cleanJavaScriptTrailingWhitespace(input),
    "const value = `first\\x20\\x20\nsecond\\t\n`;\n",
  );
});

test("rejects likely tagged templates instead of changing raw string contents", () => {
  assert.throws(
    () => cleanJavaScriptTrailingWhitespace("tag`value  \n`;\n"),
    /tagged template literal/i,
  );
});
