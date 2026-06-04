import assert from "node:assert/strict";
import test from "node:test";
import { fetchContributionDays } from "../src/github.ts";

test("flattens contribution days from GraphQL response", async () => {
  const fetchImpl = async () =>
    new Response(JSON.stringify({
      data: {
        user: {
          createdAt: "2020-01-01T00:00:00Z",
          contributionsCollection: {
            contributionYears: [2026],
            contributionCalendar: {
              weeks: [
                { contributionDays: [{ date: "2026-06-04", contributionCount: 2 }] },
              ],
            },
          },
        },
      },
    }), { status: 200 });

  const days = await fetchContributionDays({
    user: "zients",
    token: "token",
    startingYear: 2026,
    currentYear: 2026,
    fetchImpl,
  });

  assert.deepEqual(days, [{ date: "2026-06-04", contributionCount: 2 }]);
});

test("throws helpful errors for GraphQL errors", async () => {
  const fetchImpl = async () =>
    new Response(JSON.stringify({ errors: [{ message: "Bad credentials" }] }), { status: 200 });

  await assert.rejects(
    () => fetchContributionDays({ user: "zients", token: "bad", startingYear: 2026, currentYear: 2026, fetchImpl }),
    /Bad credentials/,
  );
});

test("validates required user and token before fetching", async () => {
  let fetchCalls = 0;
  const fetchImpl = async () => {
    fetchCalls += 1;
    return new Response(JSON.stringify({}), { status: 200 });
  };

  await assert.rejects(
    () => fetchContributionDays({ user: "", token: "token", fetchImpl }),
    /GitHub user is required/,
  );
  await assert.rejects(
    () => fetchContributionDays({ user: "zients", token: "", fetchImpl }),
    /GitHub token is required/,
  );
  await assert.rejects(
    () => fetchContributionDays({ token: "token", fetchImpl } as unknown as Parameters<typeof fetchContributionDays>[0]),
    /GitHub user is required/,
  );
  await assert.rejects(
    () => fetchContributionDays({ user: "zients", fetchImpl } as unknown as Parameters<typeof fetchContributionDays>[0]),
    /GitHub token is required/,
  );

  assert.equal(fetchCalls, 0);
});

test("throws HTTP status errors before parsing non-OK response bodies", async () => {
  const fetchImpl = async () => new Response("not json", { status: 500 });

  await assert.rejects(
    () => fetchContributionDays({ user: "zients", token: "token", fetchImpl }),
    /GitHub GraphQL request failed with HTTP 500\./,
  );
});

test("throws malformed calendar error for invalid week contribution days", async () => {
  const fetchImpl = async () =>
    new Response(JSON.stringify({
      data: {
        user: {
          contributionsCollection: {
            contributionCalendar: {
              weeks: [{}],
            },
          },
        },
      },
    }), { status: 200 });

  await assert.rejects(
    () => fetchContributionDays({ user: "zients", token: "token", fetchImpl }),
    /GitHub response included malformed contribution calendar weeks\./,
  );
});
