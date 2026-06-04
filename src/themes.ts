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

type ThemeName =
  | "default" | "dark" | "highcontrast" | "radical"
  | "merko" | "gruvbox" | "tokyonight" | "onedark" | "cobalt"
  | "synthwave" | "dracula" | "prussian" | "monokai"
  | "vue" | "vue-dark" | "transparent";

const themes: Record<ThemeName, ResolvedTheme> = {
  default: {
    background: "#FFFEFE", border: "#E4E2E2", stroke: "#E4E2E2",
    ring: "#FB8C00", fire: "#FB8C00",
    currentStreakNumber: "#151515", sideNumbers: "#151515",
    currentStreakLabel: "#FB8C00", sideLabels: "#151515",
    dateText: "#464646", excludedDaysLabel: "#464646",
  },
  dark: {
    background: "#151515", border: "#E4E2E2", stroke: "#E4E2E2",
    ring: "#FB8C00", fire: "#FB8C00",
    currentStreakNumber: "#FEFEFE", sideNumbers: "#FEFEFE",
    currentStreakLabel: "#FB8C00", sideLabels: "#FEFEFE",
    dateText: "#9E9E9E", excludedDaysLabel: "#9E9E9E",
  },
  highcontrast: {
    background: "#000000", border: "#BEBEBE", stroke: "#BEBEBE",
    ring: "#FB8C00", fire: "#FB8C00",
    currentStreakNumber: "#FFFFFF", sideNumbers: "#FFFFFF",
    currentStreakLabel: "#FB8C00", sideLabels: "#FFFFFF",
    dateText: "#C5C5C5", excludedDaysLabel: "#C5C5C5",
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
  merko: {
    background: "#0A0F0B", border: "#E4E2E2", stroke: "#E4E2E2",
    ring: "#ABD200", fire: "#ABD200",
    currentStreakNumber: "#B7D364", sideNumbers: "#ABD200",
    currentStreakLabel: "#B7D364", sideLabels: "#ABD200",
    dateText: "#68B587", excludedDaysLabel: "#68B587",
  },
  gruvbox: {
    background: "#282828", border: "#E4E2E2", stroke: "#E4E2E2",
    ring: "#FABD2F", fire: "#FABD2F",
    currentStreakNumber: "#FE8019", sideNumbers: "#FABD2F",
    currentStreakLabel: "#FE8019", sideLabels: "#FABD2F",
    dateText: "#8EC07C", excludedDaysLabel: "#8EC07C",
  },
  tokyonight: {
    background: "#1A1B27", border: "#E4E2E2", stroke: "#E4E2E2",
    ring: "#70A5FD", fire: "#70A5FD",
    currentStreakNumber: "#BF91F3", sideNumbers: "#70A5FD",
    currentStreakLabel: "#BF91F3", sideLabels: "#70A5FD",
    dateText: "#38BDAE", excludedDaysLabel: "#38BDAE",
  },
  onedark: {
    background: "#282C34", border: "#E4E2E2", stroke: "#E4E2E2",
    ring: "#E4BF7A", fire: "#E4BF7A",
    currentStreakNumber: "#8EB573", sideNumbers: "#E4BF7A",
    currentStreakLabel: "#8EB573", sideLabels: "#E4BF7A",
    dateText: "#DF6D74", excludedDaysLabel: "#DF6D74",
  },
  cobalt: {
    background: "#0000", border: "#E4E2E2", stroke: "#E4E2E2",
    ring: "#E683D9", fire: "#E683D9",
    currentStreakNumber: "#0480EF", sideNumbers: "#E683D9",
    currentStreakLabel: "#0480EF", sideLabels: "#E683D9",
    dateText: "#75EEB2", excludedDaysLabel: "#75EEB2",
  },
  synthwave: {
    background: "#2B213A", border: "#E4E2E2", stroke: "#E4E2E2",
    ring: "#E2E9EC", fire: "#E2E9EC",
    currentStreakNumber: "#EF8539", sideNumbers: "#E2E9EC",
    currentStreakLabel: "#EF8539", sideLabels: "#E2E9EC",
    dateText: "#E5289E", excludedDaysLabel: "#E5289E",
  },
  dracula: {
    background: "#282A36", border: "#E4E2E2", stroke: "#E4E2E2",
    ring: "#FF6E96", fire: "#FF6E96",
    currentStreakNumber: "#79DAFA", sideNumbers: "#FF6E96",
    currentStreakLabel: "#79DAFA", sideLabels: "#FF6E96",
    dateText: "#F8F8F2", excludedDaysLabel: "#F8F8F2",
  },
  prussian: {
    background: "#172F45", border: "#E4E2E2", stroke: "#E4E2E2",
    ring: "#BDDFFF", fire: "#BDDFFF",
    currentStreakNumber: "#38A0FF", sideNumbers: "#BDDFFF",
    currentStreakLabel: "#38A0FF", sideLabels: "#BDDFFF",
    dateText: "#6E93B5", excludedDaysLabel: "#6E93B5",
  },
  monokai: {
    background: "#272822", border: "#E4E2E2", stroke: "#E4E2E2",
    ring: "#EB1F6A", fire: "#EB1F6A",
    currentStreakNumber: "#E28905", sideNumbers: "#EB1F6A",
    currentStreakLabel: "#E28905", sideLabels: "#EB1F6A",
    dateText: "#F1F1EB", excludedDaysLabel: "#F1F1EB",
  },
  vue: {
    background: "#FFFEFE", border: "#A8A8A8", stroke: "#A8A8A8",
    ring: "#41B883", fire: "#41B883",
    currentStreakNumber: "#41B883", sideNumbers: "#41B883",
    currentStreakLabel: "#41B883", sideLabels: "#41B883",
    dateText: "#273849", excludedDaysLabel: "#273849",
  },
  "vue-dark": {
    background: "#273849", border: "#E4E2E2", stroke: "#E4E2E2",
    ring: "#41B883", fire: "#41B883",
    currentStreakNumber: "#41B883", sideNumbers: "#41B883",
    currentStreakLabel: "#41B883", sideLabels: "#41B883",
    dateText: "#FFFEFE", excludedDaysLabel: "#FFFEFE",
  },
  transparent: {
    background: "#0000", border: "#E4E2E2", stroke: "#E4E2E2",
    ring: "#006AFF", fire: "#006AFF",
    currentStreakNumber: "#0579C3", sideNumbers: "#006AFF",
    currentStreakLabel: "#0579C3", sideLabels: "#006AFF",
    dateText: "#417E87", excludedDaysLabel: "#417E87",
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
