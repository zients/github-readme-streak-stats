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
const defaultHeight = 195;

export function renderSvg(input: RenderSvgInput): string {
  const { options, theme, stats } = input;
  const width = options.cardWidth;
  const height = options.cardHeight;
  const radius = Math.min(options.borderRadius, width / 2, height / 2);
  const columnWidth = width / 3;
  const centerX = width / 2;
  const y = createVerticalScale(height);
  const title = input.title ?? `${options.user}'s GitHub Streak`;
  const clipId = "streak-card-clip";
  const ringMaskId = "streak-ring-mask";
  const numberOptions = { locale: options.locale, shortNumbers: options.shortNumbers };
  const dateOptions = options.dateFormat === undefined
    ? { locale: options.locale }
    : { locale: options.locale, dateFormat: options.dateFormat };
  const parts: string[] = [
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}' width='${width}px' height='${height}px' role='img' aria-label='${escapeXml(title)}'>`,
    `<title>${escapeXml(title)}</title>`,
    `<defs><clipPath id='${clipId}'><rect width='${width}' height='${height}' rx='${radius}'/></clipPath><mask id='${ringMaskId}'><rect width='${width}' height='${height}' fill='white'/><ellipse cx='${centerX}' cy='${y(32)}' rx='13' ry='18' fill='black'/></mask></defs>`,
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
      valueY: y(80),
      labelY: y(116),
      rangeY: y(146),
      value: formatNumber(stats.totalContributions, numberOptions),
      label: "Total Contributions",
      range: stats.firstContribution === "" ? "" : `Since ${formatDate(stats.firstContribution, dateOptions)}`,
      theme,
    }));
  }

  if (!options.hideCurrentStreak) {
    parts.push(renderCurrentSection({
      x: centerX,
      circleY: y(71),
      flameY: y(19.5),
      valueY: y(80),
      labelY: y(140),
      rangeY: y(166),
      value: formatNumber(stats.currentStreak.length, numberOptions),
      label: "Current Streak",
      range: formatDateRange(stats.currentStreak.start, stats.currentStreak.end, dateOptions),
      theme,
      ringMaskId,
    }));
  }

  if (!options.hideLongestStreak) {
    parts.push(renderSideSection({
      x: columnWidth * 2.5,
      valueY: y(80),
      labelY: y(116),
      rangeY: y(146),
      value: formatNumber(stats.longestStreak.length, numberOptions),
      label: "Longest Streak",
      range: formatDateRange(stats.longestStreak.start, stats.longestStreak.end, dateOptions),
      theme,
    }));
  }

  parts.push(
    "</g>",
    `<rect x='0.5' y='0.5' width='${width - 1}' height='${height - 1}' rx='${Math.max(radius - 0.5, 0)}' fill='none' stroke='${escapeXml(theme.border)}'/>`,
  );

  if (options.mode === "daily" && options.excludeDays.length > 0) {
    parts.push(excludedDaysLabel(options.excludeDays, theme.excludedDaysLabel, y));
  }

  parts.push("</svg>");

  return parts.join("");
}

function renderCurrentSection(input: {
  x: number;
  circleY: number;
  flameY: number;
  valueY: number;
  labelY: number;
  rangeY: number;
  value: string;
  label: string;
  range: string;
  theme: ResolvedTheme;
  ringMaskId: string;
}): string {
  const { x, circleY, flameY, valueY, labelY, rangeY, value, label, range, theme, ringMaskId } = input;

  return [
    `<g text-anchor='middle'>`,
    `<circle cx='${x}' cy='${circleY}' r='40' fill='none' stroke='${escapeXml(theme.ring)}' stroke-width='5' mask='url(#${ringMaskId})'/>`,
    `<path d='${flamePath}' transform='translate(${x} ${flameY}) scale(0.9)' fill='${escapeXml(theme.fire)}'/>`,
    textLine(x, valueY, value, theme.currentStreakNumber, 28, 700),
    textLine(x, labelY, label, theme.currentStreakLabel, 14, 700),
    textLine(x, rangeY, range, theme.dateText, 12, 400),
    `</g>`,
  ].join("");
}

function renderSideSection(input: {
  x: number;
  valueY: number;
  labelY: number;
  rangeY: number;
  value: string;
  label: string;
  range: string;
  theme: ResolvedTheme;
}): string {
  const { x, valueY, labelY, rangeY, value, label, range, theme } = input;

  return [
    `<g text-anchor='middle'>`,
    textLine(x, valueY, value, theme.sideNumbers, 28, 700),
    textLine(x, labelY, label, theme.sideLabels, 14, 400),
    textLine(x, rangeY, range, theme.dateText, 12, 400),
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
  const y = createVerticalScale(height);

  return `<line x1='${x}' y1='${y(28)}' x2='${x}' y2='${y(170)}' stroke='${escapeXml(stroke)}' stroke-width='1' opacity='0.35'/>`;
}

function createVerticalScale(height: number): (value: number) => number {
  const scale = height / defaultHeight;

  return (value: number) => Number((value * scale).toFixed(2));
}

function excludedDaysLabel(
  days: string[],
  color: string,
  y: (value: number) => number,
): string {
  const text = `* Excluding ${days.join(", ")}`;
  // 186 = 9px above the bottom of the default 195px-tall card (scaled by y())
  return `<text x='12' y='${y(186)}' fill='${escapeXml(color)}' font-family='Segoe UI, Ubuntu, sans-serif' font-size='10' font-weight='400'>${escapeXml(text)}</text>`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
