export interface ContributionDay {
  date: string;
  contributionCount: number;
}

export interface StreakRange {
  start: string;
  end: string;
  length: number;
}

export interface StatsResult {
  totalContributions: number;
  firstContribution: string;
  currentStreak: StreakRange;
  longestStreak: StreakRange;
  mode: "daily" | "weekly";
}

interface CalculateStatsOptions {
  mode: "daily" | "weekly";
  excludeDays: string[];
  today: string;
}

const emptyStreak = (): StreakRange => ({ start: "", end: "", length: 0 });
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateToOrdinal(date: string): number {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

function ordinalToDate(ordinal: number): string {
  return new Date(ordinal * 86400000).toISOString().slice(0, 10);
}

function dayName(ordinal: number): string {
  return dayNames[new Date(ordinal * 86400000).getUTCDay()] ?? "";
}

function normalizeDays(days: ContributionDay[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const day of days) {
    counts.set(day.date, (counts.get(day.date) ?? 0) + day.contributionCount);
  }

  return counts;
}

function betterStreak(current: StreakRange, longest: StreakRange): StreakRange {
  return current.length > longest.length ? { ...current } : longest;
}

function calculateDailyStreaks(
  countsByDate: Map<string, number>,
  options: CalculateStatsOptions,
): Pick<StatsResult, "currentStreak" | "longestStreak"> {
  const ordinals = [...countsByDate.keys()].map(dateToOrdinal).sort((a, b) => a - b);

  if (ordinals.length === 0) {
    return { currentStreak: emptyStreak(), longestStreak: emptyStreak() };
  }

  const excludedDays = new Set(options.excludeDays);
  const todayOrdinal = dateToOrdinal(options.today);
  const todayActive = (countsByDate.get(options.today) ?? 0) > 0;
  const currentEndOrdinal = todayActive ? todayOrdinal : todayOrdinal - 1;
  let current = emptyStreak();
  let longest = emptyStreak();
  let currentAtEffectiveEnd = emptyStreak();

  for (let ordinal = ordinals[0] ?? 0; ordinal <= Math.max(ordinals.at(-1) ?? 0, currentEndOrdinal); ordinal += 1) {
    const date = ordinalToDate(ordinal);
    const hasDate = countsByDate.has(date);
    const active = (countsByDate.get(date) ?? 0) > 0;
    const excluded = hasDate && excludedDays.has(dayName(ordinal));

    if (active) {
      if (current.length === 0) {
        current = { start: date, end: date, length: 1 };
      } else {
        current = { ...current, end: date, length: current.length + 1 };
      }
    } else if (excluded && current.length > 0) {
      current = { ...current, end: date, length: current.length + 1 };
    } else {
      current = emptyStreak();
    }

    longest = betterStreak(current, longest);

    if (ordinal === currentEndOrdinal) {
      currentAtEffectiveEnd = { ...current };
    }
  }

  return { currentStreak: currentAtEffectiveEnd, longestStreak: longest };
}

function previousSunday(ordinal: number): number {
  return ordinal - new Date(ordinal * 86400000).getUTCDay();
}

function calculateWeeklyStreaks(
  countsByDate: Map<string, number>,
  today: string,
): Pick<StatsResult, "currentStreak" | "longestStreak"> {
  const countsByWeek = new Map<number, number>();

  for (const [date, count] of countsByDate) {
    const weekStart = previousSunday(dateToOrdinal(date));
    countsByWeek.set(weekStart, (countsByWeek.get(weekStart) ?? 0) + count);
  }

  const weekStarts = [...countsByWeek.keys()].sort((a, b) => a - b);

  if (weekStarts.length === 0) {
    return { currentStreak: emptyStreak(), longestStreak: emptyStreak() };
  }

  const currentWeekStart = previousSunday(dateToOrdinal(today));
  const effectiveEnd = (countsByWeek.get(currentWeekStart) ?? 0) > 0
    ? currentWeekStart
    : currentWeekStart - 7;
  let current = emptyStreak();
  let longest = emptyStreak();
  let currentAtEffectiveEnd = emptyStreak();

  for (let weekStart = weekStarts[0] ?? 0; weekStart <= Math.max(weekStarts.at(-1) ?? 0, effectiveEnd); weekStart += 7) {
    const active = (countsByWeek.get(weekStart) ?? 0) > 0;
    const date = ordinalToDate(weekStart);

    if (active) {
      if (current.length === 0) {
        current = { start: date, end: date, length: 1 };
      } else {
        current = { ...current, end: date, length: current.length + 1 };
      }
    } else {
      current = emptyStreak();
    }

    longest = betterStreak(current, longest);

    if (weekStart === effectiveEnd) {
      currentAtEffectiveEnd = { ...current };
    }
  }

  return { currentStreak: currentAtEffectiveEnd, longestStreak: longest };
}

export function calculateStats(
  days: ContributionDay[],
  options: CalculateStatsOptions,
): StatsResult {
  const countsByDate = normalizeDays(days);
  const sortedDates = [...countsByDate.keys()].sort();
  const totalContributions = [...countsByDate.values()].reduce((total, count) => total + count, 0);
  const firstContribution = sortedDates.find((date) => (countsByDate.get(date) ?? 0) > 0) ?? "";
  const streaks = options.mode === "weekly"
    ? calculateWeeklyStreaks(countsByDate, options.today)
    : calculateDailyStreaks(countsByDate, options);

  return {
    totalContributions,
    firstContribution,
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.longestStreak,
    mode: options.mode,
  };
}
