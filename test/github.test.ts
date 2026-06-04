import assert from "node:assert/strict";
import test from "node:test";
import { fetchContributionDays } from "../src/github.js";

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

test("throws helpful error for null GraphQL response payload", async () => {
  const fetchImpl = async () => new Response("null", { status: 200 });

  await assert.rejects(
    () => fetchContributionDays({ user: "zients", token: "token", startingYear: 2026, currentYear: 2026, fetchImpl }),
    /GitHub response did not include contribution calendar weeks\./,
  );
});

test("throws helpful error for invalid JSON in successful GitHub responses", async () => {
  const fetchImpl = async () => new Response("not json", { status: 200 });

  await assert.rejects(
    () => fetchContributionDays({ user: "zients", token: "token", startingYear: 2026, currentYear: 2026, fetchImpl }),
    /GitHub response was not valid JSON\./,
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

test("falls back to HTTP status errors for non-JSON non-OK response bodies", async () => {
  const fetchImpl = async () => new Response("not json", { status: 500 });

  await assert.rejects(
    () => fetchContributionDays({ user: "zients", token: "token", fetchImpl }),
    /GitHub GraphQL request failed with HTTP 500\./,
  );
});

test("includes GitHub error messages from non-OK JSON response bodies", async () => {
  const fetchImpl = async () => new Response(JSON.stringify({ message: "Bad credentials" }), { status: 401 });

  await assert.rejects(
    () => fetchContributionDays({ user: "zients", token: "bad", fetchImpl }),
    /GitHub GraphQL request failed with HTTP 401: Bad credentials\./,
  );
});

test("throws helpful error when the GitHub user is missing", async () => {
  const fetchImpl = async () => new Response(JSON.stringify({ data: { user: null } }), { status: 200 });

  await assert.rejects(
    () => fetchContributionDays({ user: "zients", token: "token", fetchImpl }),
    /Could not find GitHub user zients\./,
  );
});

test("requests each year with GraphQL variables instead of interpolating user", async () => {
  const calls: Array<{ url: string | URL | Request; init: RequestInit | undefined }> = [];
  const fetchImpl = async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({
      data: {
        user: {
          contributionsCollection: {
            contributionCalendar: {
              weeks: [],
            },
          },
        },
      },
    }), { status: 200 });
  };

  await fetchContributionDays({
    user: "octo-user",
    token: "secret-token",
    startingYear: 2025,
    currentYear: 2026,
    fetchImpl,
  });

  assert.equal(calls.length, 2);
  const [firstCall, secondCall] = calls;
  assert.ok(firstCall);
  assert.ok(secondCall);

  for (const call of calls) {
    assert.equal(call.url, "https://api.github.com/graphql");
    assert.equal(call.init?.method, "POST");
    assert.equal((call.init?.headers as Record<string, string>).Authorization, "bearer secret-token");
    assert.equal((call.init?.headers as Record<string, string>)["Content-Type"], "application/json");
    assert.equal((call.init?.headers as Record<string, string>).Accept, "application/vnd.github+json");
    assert.equal(
      (call.init?.headers as Record<string, string>)["User-Agent"],
      "zients-github-readme-streak-stats",
    );
  }

  const firstBody = JSON.parse(firstCall.init?.body as string) as {
    query: string;
    variables: { user: string; from: string; to: string };
  };
  const secondBody = JSON.parse(secondCall.init?.body as string) as {
    query: string;
    variables: { user: string; from: string; to: string };
  };

  assert.deepEqual(firstBody.variables, {
    user: "octo-user",
    from: "2025-01-01T00:00:00Z",
    to: "2025-12-31T23:59:59Z",
  });
  assert.deepEqual(secondBody.variables, {
    user: "octo-user",
    from: "2026-01-01T00:00:00Z",
    to: "2026-12-31T23:59:59Z",
  });
  assert.equal(firstBody.query.includes("octo-user"), false);
  assert.equal(secondBody.query.includes("octo-user"), false);
});

test("throws malformed calendar error for invalid week entries", async () => {
  const fetchImpl = async (weeks: unknown[]) =>
    new Response(JSON.stringify({
      data: {
        user: {
          contributionsCollection: {
            contributionCalendar: {
              weeks,
            },
          },
        },
      },
    }), { status: 200 });

  await assert.rejects(
    () => fetchContributionDays({ user: "zients", token: "token", fetchImpl: () => fetchImpl([{}]) }),
    /GitHub response included malformed contribution calendar weeks\./,
  );
  await assert.rejects(
    () => fetchContributionDays({ user: "zients", token: "token", fetchImpl: () => fetchImpl([null]) }),
    /GitHub response included malformed contribution calendar weeks\./,
  );
  await assert.rejects(
    () => fetchContributionDays({
      user: "zients",
      token: "token",
      fetchImpl: () => fetchImpl([{ contributionDays: null }]),
    }),
    /GitHub response included malformed contribution calendar weeks\./,
  );
  await assert.rejects(
    () => fetchContributionDays({
      user: "zients",
      token: "token",
      fetchImpl: () => fetchImpl([{ contributionDays: {} }]),
    }),
    /GitHub response included malformed contribution calendar weeks\./,
  );
  await assert.rejects(
    () => fetchContributionDays({
      user: "zients",
      token: "token",
      fetchImpl: () => fetchImpl([{ contributionDays: [null] }]),
    }),
    /GitHub response included malformed contribution calendar weeks\./,
  );
  await assert.rejects(
    () => fetchContributionDays({
      user: "zients",
      token: "token",
      fetchImpl: () => fetchImpl([{ contributionDays: [{ date: "2026-06-04", contributionCount: "2" }] }]),
    }),
    /GitHub response included malformed contribution calendar weeks\./,
  );
});

test("throws malformed GraphQL errors message for invalid GraphQL error entries", async () => {
  const fetchImpl = async (errors: unknown) =>
    new Response(JSON.stringify({ errors }), { status: 200 });

  await assert.rejects(
    () => fetchContributionDays({
      user: "zients",
      token: "token",
      fetchImpl: () => fetchImpl("bad"),
    }),
    /GitHub response included malformed GraphQL errors\./,
  );
  await assert.rejects(
    () => fetchContributionDays({
      user: "zients",
      token: "token",
      fetchImpl: () => fetchImpl([{ message: 123 }]),
    }),
    /GitHub response included malformed GraphQL errors\./,
  );
});
