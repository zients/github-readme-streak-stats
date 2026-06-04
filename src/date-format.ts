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
    return applyCustomDateFormat(date, options.dateFormat, includeYear, options.locale);
  }

  const dateObj = new Date(`${date}T00:00:00Z`);
  return new Intl.DateTimeFormat(options.locale, {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: includeYear ? "numeric" : undefined,
  }).format(dateObj);
}

function applyCustomDateFormat(date: string, format: string, includeBracketed: boolean, locale: string): string {
  const dateObj = new Date(`${date}T00:00:00Z`);
  const activeFormat = format.replace(/\[([^\]]+)\]/g, includeBracketed ? "$1" : "");
  const part = (opts: Intl.DateTimeFormatOptions): string =>
    new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...opts }).format(dateObj);
  const year = dateObj.getUTCFullYear();
  const day = dateObj.getUTCDate();

  const replacements: Record<string, string> = {
    Y: String(year),
    y: String(year).slice(-2),
    F: part({ month: "long" }),
    M: part({ month: "short" }),
    n: String(dateObj.getUTCMonth() + 1),
    l: part({ weekday: "long" }),
    D: part({ weekday: "short" }),
    j: String(day),
    d: String(day).padStart(2, "0"),
    S: ordinalSuffix(day),
  };

  return activeFormat.replace(/[YyFMnljdDS]/g, (token) => replacements[token] ?? token);
}

function ordinalSuffix(day: number): string {
  const mod100 = day % 100;

  if (mod100 >= 11 && mod100 <= 13) {
    return "th";
  }

  return { 1: "st", 2: "nd", 3: "rd" }[day % 10] ?? "th";
}
