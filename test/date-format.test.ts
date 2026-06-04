import assert from "node:assert/strict";
import test from "node:test";
import { formatDate, formatDateRange, formatNumber } from "../src/date-format.js";

test("formats single dates with year by default", () => {
  assert.equal(formatDate("2019-07-19", { locale: "en" }), "Jul 19, 2019");
});

test("formats single dates with bracketed custom date format", () => {
  assert.equal(
    formatDate("2019-07-19", { locale: "en", dateFormat: "M j[, Y]" }),
    "Jul 19, 2019",
  );
});

test("formats current-year date range without repeated year by default", () => {
  assert.equal(formatDateRange("2026-05-22", "2026-06-04", { locale: "en" }), "May 22 - Jun 4");
});

test("formats cross-year date range with years", () => {
  assert.equal(formatDateRange("2025-12-31", "2026-01-02", { locale: "en" }), "Dec 31, 2025 - Jan 2, 2026");
});

test("supports bracketed custom date format", () => {
  assert.equal(
    formatDateRange("2025-12-31", "2026-01-02", { locale: "en", dateFormat: "M j[, Y]" }),
    "Dec 31, 2025 - Jan 2, 2026",
  );
});

test("omits bracketed custom date tokens without re-tokenizing month names", () => {
  assert.equal(
    formatDateRange("2026-06-03", "2026-06-04", { locale: "en", dateFormat: "M j[, Y]" }),
    "Jun 3 - Jun 4",
  );
});

test("supports extended custom date tokens", () => {
  assert.equal(formatDate("2020-04-14", { locale: "en", dateFormat: "d F[, Y]" }), "14 April, 2020");
  assert.equal(formatDate("2020-04-14", { locale: "en", dateFormat: "jS M" }), "14th Apr");
  assert.equal(formatDate("2020-04-14", { locale: "en", dateFormat: "[Y.]n.j" }), "2020.4.14");
  assert.equal(formatDate("2020-04-14", { locale: "en", dateFormat: "l, D" }), "Tuesday, Tue");
  assert.equal(formatDate("2020-04-14", { locale: "en", dateFormat: "j/n/y" }), "14/4/20");
});

test("omits bracketed year in same-year range with extended tokens", () => {
  assert.equal(
    formatDateRange("2024-04-10", "2024-04-14", { locale: "en", dateFormat: "d F[, Y]" }),
    "10 April - 14 April",
  );
});

test("formats standard and short numbers", () => {
  assert.equal(formatNumber(1251, { locale: "en", shortNumbers: false }), "1,251");
  assert.equal(formatNumber(15200, { locale: "en", shortNumbers: true }), "15.2K");
});
