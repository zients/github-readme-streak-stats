import type { StreakOptions } from "./options.js";
import type { ResolvedTheme } from "./themes.js";
import type { StatsResult } from "./stats.js";
import { formatDate, formatDateRange, formatNumber } from "./date-format.js";

export interface RenderSvgInput {
  options: StreakOptions;
  theme: ResolvedTheme;
  stats: StatsResult;
  title?: string;
}

const flamePath = "M 1.5 0.67 C 1.5 0.67 2.24 3.32 2.24 5.47 C 2.24 7.53 0.89 9.2 -1.17 9.2 C -3.23 9.2 -4.79 7.53 -4.79 5.47 L -4.76 5.11 C -6.78 7.51 -8 10.62 -8 13.99 C -8 18.41 -4.42 22 0 22 C 4.42 22 8 18.41 8 13.99 C 8 8.6 5.41 3.79 1.5 0.67 Z";

export function renderSvg(input: RenderSvgInput): string {
  const { options, theme, stats } = input;
  const width = options.cardWidth;
  const height = options.cardHeight;
  const radius = Math.min(options.borderRadius, width / 2, height / 2);
  const columnWidth = width / 3;
  const centerX = width / 2;
  const centerY = height / 2;
  const title = input.title ?? `${options.user}'s GitHub Streak`;
  const clipId = "streak-card-clip";
  const numberOptions = { locale: options.locale, shortNumbers: options.shortNumbers };
  const dateOptions = options.dateFormat === undefined
    ? { locale: options.locale }
    : { locale: options.locale, dateFormat: options.dateFormat };
  const parts: string[] = [
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}' width='${width}px' height='${height}px' role='img' aria-label='${escapeXml(title)}'>`,
    `<title>${escapeXml(title)}</title>`,
    `<defs><clipPath id='${clipId}'><rect width='${width}' height='${height}' rx='${radius}'/></clipPath></defs>`,
    `<rect width='${width}' height='${height}' rx='${radius}' fill='${escapeXml(theme.background)}'/>`,
    `<g clip-path='url(#${clipId})'>`,
  ];

  if (!options.hideTotalContributions) {
    parts.push(divider(columnWidth, height, theme.stroke));
  }

  if (!options.hideLongestStreak) {
    parts.push(divider(columnWidth * 2, height, theme.stroke));
  }

  if (!options.hideTotalContributions) {
    parts.push(renderSideSection({
      x: columnWidth / 2,
      y: centerY,
      value: formatNumber(stats.totalContributions, numberOptions),
      label: "Total Contributions",
      range: stats.firstContribution === "" ? "" : `Since ${formatDate(stats.firstContribution, dateOptions)}`,
      theme,
    }));
  }

  if (!options.hideCurrentStreak) {
    parts.push(renderCurrentSection({
      x: centerX,
      y: centerY,
      value: formatNumber(stats.currentStreak.length, numberOptions),
      label: "Current Streak",
      range: formatDateRange(stats.currentStreak.start, stats.currentStreak.end, dateOptions),
      theme,
    }));
  }

  if (!options.hideLongestStreak) {
    parts.push(renderSideSection({
      x: columnWidth * 2.5,
      y: centerY,
      value: formatNumber(stats.longestStreak.length, numberOptions),
      label: "Longest Streak",
      range: formatDateRange(stats.longestStreak.start, stats.longestStreak.end, dateOptions),
      theme,
    }));
  }

  parts.push(
    "</g>",
    `<rect x='0.5' y='0.5' width='${width - 1}' height='${height - 1}' rx='${Math.max(radius - 0.5, 0)}' fill='none' stroke='${escapeXml(theme.border)}'/>`,
    "</svg>",
  );

  return parts.join("");
}

function renderCurrentSection(input: {
  x: number;
  y: number;
  value: string;
  label: string;
  range: string;
  theme: ResolvedTheme;
}): string {
  const { x, y, value, label, range, theme } = input;

  return [
    `<g text-anchor='middle'>`,
    `<circle cx='${x}' cy='${y - 18}' r='40' fill='none' stroke='${escapeXml(theme.stroke)}' stroke-width='2' opacity='0.35'/>`,
    `<circle cx='${x}' cy='${y - 18}' r='40' fill='none' stroke='${escapeXml(theme.ring)}' stroke-width='4' stroke-linecap='round'/>`,
    `<path d='${flamePath}' transform='translate(${x} ${y - 54}) scale(0.9)' fill='${escapeXml(theme.fire)}'/>`,
    textLine(x, y - 6, value, theme.currentStreakNumber, 32, 700),
    textLine(x, y + 28, label, theme.currentStreakLabel, 14, 600),
    textLine(x, y + 51, range, theme.dateText, 12, 400),
    `</g>`,
  ].join("");
}

function renderSideSection(input: {
  x: number;
  y: number;
  value: string;
  label: string;
  range: string;
  theme: ResolvedTheme;
}): string {
  const { x, y, value, label, range, theme } = input;

  return [
    `<g text-anchor='middle'>`,
    textLine(x, y - 22, value, theme.sideNumbers, 26, 700),
    textLine(x, y + 10, label, theme.sideLabels, 13, 600),
    textLine(x, y + 32, range, theme.dateText, 11, 400),
    `</g>`,
  ].join("");
}

function textLine(
  x: number,
  y: number,
  value: string,
  fill: string,
  size: number,
  weight: number,
): string {
  return `<text x='${x}' y='${y}' fill='${escapeXml(fill)}' font-family='Segoe UI, Ubuntu, sans-serif' font-size='${size}' font-weight='${weight}'>${escapeXml(value)}</text>`;
}

function divider(x: number, height: number, stroke: string): string {
  return `<line x1='${x}' y1='26' x2='${x}' y2='${height - 26}' stroke='${escapeXml(stroke)}' stroke-width='1' opacity='0.35'/>`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
