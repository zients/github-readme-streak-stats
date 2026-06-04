import * as core from "@actions/core";
import { writeFileAtomically } from "./files.js";
import { fetchContributionDays } from "./github.js";
import { parseOptions } from "./options.js";
import { renderSvg } from "./render-svg.js";
import { calculateStats } from "./stats.js";
import { resolveTheme } from "./themes.js";

async function run(): Promise<void> {
  const optionsInput = core.getInput("options") || "";
  const outputPath = core.getInput("path") || "profile/streak.svg";
  const token = core.getInput("token") || process.env.GITHUB_TOKEN || "";
  if (!token) {
    throw new Error("Missing GitHub token. Pass the token input or set GITHUB_TOKEN.");
  }

  const options = parseOptions(optionsInput);
  if (!options.user) {
    throw new Error("Missing GitHub username. Pass options: user=<username>.");
  }

  const days = await fetchContributionDays({
    user: options.user,
    token,
    ...(options.startingYear === undefined ? {} : { startingYear: options.startingYear }),
  });
  const today = new Date().toISOString().slice(0, 10);
  const stats = calculateStats(days, {
    mode: options.mode,
    excludeDays: options.excludeDays,
    today,
  });
  const svg = renderSvg({
    options,
    theme: resolveTheme(options),
    stats,
    title: `${options.user}'s GitHub streak`,
  });

  await writeFileAtomically(outputPath, svg);
  core.setOutput("path", outputPath);
  core.info(`Wrote ${outputPath}`);
}

run().catch((error: unknown) => {
  core.setFailed(error instanceof Error ? error.message : String(error));
});
