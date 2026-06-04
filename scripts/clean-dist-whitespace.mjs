import { readFile, writeFile } from "node:fs/promises";

const files = [
  "dist/index.js",
  "dist/sourcemap-register.cjs",
];

for (const file of files) {
  const input = await readFile(file, "utf8");
  const output = input.replace(/[ \t]+$/gm, "");

  if (output !== input) {
    await writeFile(file, output);
  }
}
