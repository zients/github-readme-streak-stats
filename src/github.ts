import type { ContributionDay } from "./stats.js";

interface FetchContributionDaysInput {
  user: string;
  token: string;
  startingYear?: number;
  currentYear?: number;
  fetchImpl?: typeof fetch;
}

interface GitHubGraphQLError {
  message: string;
}

interface GitHubContributionWeek {
  contributionDays?: unknown;
}

interface GitHubGraphQLPayload {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          weeks?: GitHubContributionWeek[];
        };
      };
    } | null;
  };
  errors?: GitHubGraphQLError[];
}

export async function fetchContributionDays(input: FetchContributionDaysInput): Promise<ContributionDay[]> {
  validateRequiredInput(input);

  const currentYear = input.currentYear ?? new Date().getUTCFullYear();
  const firstYear = input.startingYear ?? currentYear;
  const fetchImpl = input.fetchImpl ?? fetch;
  const allDays: ContributionDay[] = [];

  for (let year = firstYear; year <= currentYear; year += 1) {
    allDays.push(...await fetchContributionDaysForYear({ ...input, year, fetchImpl }));
  }

  return allDays;
}

async function fetchContributionDaysForYear(
  input: FetchContributionDaysInput & { year: number; fetchImpl: typeof fetch },
): Promise<ContributionDay[]> {
  const response = await input.fetchImpl("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${input.token}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v4.idl",
      "User-Agent": "zients-github-readme-streak-stats",
    },
    body: JSON.stringify({
      query: buildContributionQuery(),
      variables: {
        user: input.user,
        from: `${input.year}-01-01T00:00:00Z`,
        to: `${input.year}-12-31T23:59:59Z`,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed with HTTP ${response.status}.`);
  }

  const payload = await response.json() as GitHubGraphQLPayload;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  const user = payload.data?.user;
  if (!user) {
    throw new Error(`Could not find GitHub user ${input.user}.`);
  }

  const weeks = user.contributionsCollection?.contributionCalendar?.weeks;
  if (!Array.isArray(weeks)) {
    throw new Error("GitHub response did not include contribution calendar weeks.");
  }

  return weeks.flatMap((week) => {
    if (!Array.isArray(week.contributionDays)) {
      throw new Error("GitHub response included malformed contribution calendar weeks.");
    }
    if (!week.contributionDays.every(isContributionDay)) {
      throw new Error("GitHub response included malformed contribution calendar weeks.");
    }

    return week.contributionDays;
  });
}

function validateRequiredInput(input: FetchContributionDaysInput): void {
  if (typeof input.user !== "string" || input.user.trim() === "") {
    throw new Error("GitHub user is required.");
  }
  if (typeof input.token !== "string" || input.token.trim() === "") {
    throw new Error("GitHub token is required.");
  }
}

function isContributionDay(day: unknown): day is ContributionDay {
  return typeof day === "object"
    && day !== null
    && typeof (day as Partial<ContributionDay>).date === "string"
    && typeof (day as Partial<ContributionDay>).contributionCount === "number";
}

function buildContributionQuery(): string {
  return `query ContributionCalendar($user: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $user) {
      createdAt
      contributionsCollection(from: $from, to: $to) {
        contributionYears
        contributionCalendar {
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }`;
}
