export type Mode = "daily" | "weekly";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type DayName = (typeof dayNames)[number];
type RawOptions = Record<string, string>;

const dayAliases: Record<string, DayName> = {
  sun: "Sun",
  sunday: "Sun",
  mon: "Mon",
  monday: "Mon",
  tue: "Tue",
  tuesday: "Tue",
  wed: "Wed",
  wednesday: "Wed",
  thu: "Thu",
  thursday: "Thu",
  fri: "Fri",
  friday: "Fri",
  sat: "Sat",
  saturday: "Sat",
};

export interface StreakOptions {
  user: string;
  theme: string;
  hideBorder: boolean;
  borderRadius: number;
  background?: string;
  border?: string;
  stroke?: string;
  ring?: string;
  fire?: string;
  currStreakNum?: string;
  sideNums?: string;
  currStreakLabel?: string;
  sideLabels?: string;
  dates?: string;
  excludeDaysLabel?: string;
  dateFormat?: string;
  locale: string;
  shortNumbers: boolean;
  mode: Mode;
  excludeDays: DayName[];
  disableAnimations: boolean;
  cardWidth: number;
  cardHeight: number;
  hideTotalContributions: boolean;
  hideCurrentStreak: boolean;
  hideLongestStreak: boolean;
  startingYear?: number | undefined;
}

export function parseOptions(input: string): StreakOptions {
  const raw = parseRawOptions(input);
  const type = raw.type ?? "svg";

  if (type !== "svg") {
    throw new Error("This GitHub Action only supports SVG output.");
  }

  return {
    user: sanitizeUser(raw.user ?? process.env.GITHUB_REPOSITORY_OWNER ?? ""),
    theme: raw.theme ?? "default",
    hideBorder: parseBoolean(raw.hide_border, false),
    borderRadius: parseNumber(raw.border_radius, 4.5),
    locale: raw.locale ?? "en",
    shortNumbers: parseBoolean(raw.short_numbers, false),
    mode: raw.mode === "weekly" ? "weekly" : "daily",
    excludeDays: parseExcludeDays(raw.exclude_days ?? ""),
    disableAnimations: parseBoolean(raw.disable_animations, false),
    cardWidth: parseNumber(raw.card_width, 495),
    cardHeight: parseNumber(raw.card_height, 195),
    hideTotalContributions: parseBoolean(raw.hide_total_contributions, false),
    hideCurrentStreak: parseBoolean(raw.hide_current_streak, false),
    hideLongestStreak: parseBoolean(raw.hide_longest_streak, false),
    ...optionalString("background", raw.background),
    ...optionalString("border", raw.border),
    ...optionalString("stroke", raw.stroke),
    ...optionalString("ring", raw.ring),
    ...optionalString("fire", raw.fire),
    ...optionalString("currStreakNum", raw.currStreakNum),
    ...optionalString("sideNums", raw.sideNums),
    ...optionalString("currStreakLabel", raw.currStreakLabel),
    ...optionalString("sideLabels", raw.sideLabels),
    ...optionalString("dates", raw.dates),
    ...optionalString("excludeDaysLabel", raw.excludeDaysLabel),
    ...optionalString("dateFormat", raw.date_format),
    ...optionalNumber("startingYear", parseOptionalNumber(raw.starting_year)),
  };
}

function parseRawOptions(input: string): RawOptions {
  const value = input.trim();

  if (!value) {
    return {};
  }

  if (value.startsWith("{")) {
    let parsed: unknown;

    try {
      parsed = JSON.parse(value);
    } catch {
      throw new Error("Invalid JSON options.");
    }

    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Invalid JSON options.");
    }

    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, item]) => item != null)
        .map(([key, item]) => [key, String(item)]),
    );
  }

  const params = new URLSearchParams(value.startsWith("?") ? value.slice(1) : value);

  return Object.fromEntries(params.entries());
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseExcludeDays(value: string): DayName[] {
  return value
    .split(",")
    .map((day) => dayAliases[day.trim().toLowerCase()])
    .filter((day): day is DayName => day !== undefined);
}

function sanitizeUser(value: string): string {
  return value.replace(/[^a-zA-Z0-9-]/g, "");
}

function optionalString<Key extends string>(
  key: Key,
  value: string | undefined,
): Partial<Record<Key, string>> {
  return value === undefined ? {} : { [key]: value } as Record<Key, string>;
}

function optionalNumber<Key extends string>(
  key: Key,
  value: number | undefined,
): Partial<Record<Key, number>> {
  return value === undefined ? {} : { [key]: value } as Record<Key, number>;
}
