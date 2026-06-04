export interface FormatOptions {
  locale: string;
  shortNumbers?: boolean;
  dateFormat?: string;
}

export function formatNumber(value: number, options: FormatOptions): string {
  if (options.shortNumbers) {
    return new Intl.NumberFormat(options.locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value).toUpperCase();
  }

  return new Intl.NumberFormat(options.locale).format(value);
}

export function formatDate(date: string, options: FormatOptions): string {
  if (date === "") return "";

  return formatSingleDate(date, options, true);
}

export function formatDateRange(start: string, end: string, options: FormatOptions): string {
  if (start === "" || end === "") return "";

  const includeYear = start.slice(0, 4) !== end.slice(0, 4);
  return `${formatSingleDate(start, options, includeYear)} - ${formatSingleDate(end, options, includeYear)}`;
}

function formatSingleDate(date: string, options: FormatOptions, includeYear: boolean): string {
  if (options.dateFormat) {
    return applyCustomDateFormat(date, options.dateFormat, includeYear);
  }

  const dateObj = new Date(`${date}T00:00:00Z`);
  return new Intl.DateTimeFormat(options.locale, {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: includeYear ? "numeric" : undefined,
  }).format(dateObj);
}

function applyCustomDateFormat(date: string, format: string, includeBracketed: boolean): string {
  const dateObj = new Date(`${date}T00:00:00Z`);
  const activeFormat = format.replace(/\[([^\]]+)\]/g, includeBracketed ? "$1" : "");

  const replacements: Record<string, string> = {
    Y: String(dateObj.getUTCFullYear()),
    M: dateObj.toLocaleString("en", { timeZone: "UTC", month: "short" }),
    n: String(dateObj.getUTCMonth() + 1),
    j: String(dateObj.getUTCDate()),
    d: String(dateObj.getUTCDate()).padStart(2, "0"),
  };

  return activeFormat.replace(/[YMnjd]/g, (token) => replacements[token] ?? token);
}
