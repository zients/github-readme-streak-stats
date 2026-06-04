import type { StreakOptions } from "./options.js";

export interface ResolvedTheme {
  background: string;
  border: string;
  stroke: string;
  ring: string;
  fire: string;
  currentStreakNumber: string;
  sideNumbers: string;
  currentStreakLabel: string;
  sideLabels: string;
  dateText: string;
  excludedDaysLabel: string;
}

type ThemeName = "default" | "dark" | "highcontrast" | "radical";

const themes: Record<ThemeName, ResolvedTheme> = {
  default: {
    background: "#FFFFFF",
    border: "#E4E2E2",
    stroke: "#E4E2E2",
    ring: "#00E676",
    fire: "#FF9800",
    currentStreakNumber: "#151515",
    sideNumbers: "#151515",
    currentStreakLabel: "#151515",
    sideLabels: "#151515",
    dateText: "#737373",
    excludedDaysLabel: "#737373",
  },
  dark: {
    background: "#151515",
    border: "#E4E2E2",
    stroke: "#E4E2E2",
    ring: "#00E676",
    fire: "#FF9800",
    currentStreakNumber: "#FFFFFF",
    sideNumbers: "#FFFFFF",
    currentStreakLabel: "#FFFFFF",
    sideLabels: "#FFFFFF",
    dateText: "#BDBDBD",
    excludedDaysLabel: "#BDBDBD",
  },
  highcontrast: {
    background: "#000000",
    border: "#FFFFFF",
    stroke: "#FFFFFF",
    ring: "#FFFFFF",
    fire: "#FFFFFF",
    currentStreakNumber: "#FFFFFF",
    sideNumbers: "#FFFFFF",
    currentStreakLabel: "#FFFFFF",
    sideLabels: "#FFFFFF",
    dateText: "#FFFFFF",
    excludedDaysLabel: "#FFFFFF",
  },
  radical: {
    background: "#141321",
    border: "#E4E2E2",
    stroke: "#E4E2E2",
    ring: "#FE428E",
    fire: "#FE428E",
    currentStreakNumber: "#F8D847",
    sideNumbers: "#FE428E",
    currentStreakLabel: "#F8D847",
    sideLabels: "#FE428E",
    dateText: "#A9FEF7",
    excludedDaysLabel: "#A9FEF7",
  },
};

const optionOverrides: Array<[keyof StreakOptions, keyof ResolvedTheme]> = [
  ["background", "background"],
  ["border", "border"],
  ["stroke", "stroke"],
  ["ring", "ring"],
  ["fire", "fire"],
  ["currStreakNum", "currentStreakNumber"],
  ["sideNums", "sideNumbers"],
  ["currStreakLabel", "currentStreakLabel"],
  ["sideLabels", "sideLabels"],
  ["dates", "dateText"],
  ["excludeDaysLabel", "excludedDaysLabel"],
];

export function resolveTheme(options: StreakOptions): ResolvedTheme {
  const theme = themes[isThemeName(options.theme) ? options.theme : "default"];
  const resolved = { ...theme };

  for (const [optionKey, themeKey] of optionOverrides) {
    const color = normalizeColor(options[optionKey]);

    if (color !== undefined) {
      resolved[themeKey] = color;
    }
  }

  if (options.hideBorder) {
    resolved.border = "transparent";
  }

  return resolved;
}

function isThemeName(value: string): value is ThemeName {
  return Object.hasOwn(themes, value);
}

function normalizeColor(value: StreakOptions[keyof StreakOptions]): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const color = value.trim();

  if (!color) {
    return undefined;
  }

  if (
    color === "transparent" ||
    color.startsWith("url(") ||
    color.includes(",") ||
    color.startsWith("#")
  ) {
    return color;
  }

  return `#${color}`;
}
