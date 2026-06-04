import type { StreakOptions } from "./options.js";
import type { StatsResult } from "./stats.js";

export function buildJson(stats: StatsResult, options: StreakOptions): {
  user: string;
  mode: StatsResult["mode"];
  totalContributions: number;
  firstContribution: string;
  currentStreak: StatsResult["currentStreak"];
  longestStreak: StatsResult["longestStreak"];
  excludedDays: string[];
} {
  return {
    user: options.user,
    mode: stats.mode,
    totalContributions: stats.totalContributions,
    firstContribution: stats.firstContribution,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    excludedDays: options.excludeDays,
  };
}
