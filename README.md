# GitHub README Streak Stats

Generate a GitHub contribution streak SVG from a GitHub Action and commit it into your own repository.

## What It Does

This action fetches a user's GitHub contribution calendar through GitHub GraphQL, calculates current and longest contribution streaks, renders an SVG card, and writes that SVG to the path you choose. It runs inside GitHub Actions with Node 24 and does not use a hosted image endpoint.

The generated card is static SVG. Current date and contribution-year selection use UTC from the action runtime.

## Basic GitHub Actions Usage

```yaml
name: Update streak stats

on:
  schedule:
    - cron: "0 3 * * *"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v6

      - name: Generate streak stats
        uses: zients/github-readme-streak-stats@v1
        with:
          options: user=${{ github.repository_owner }}&theme=radical&disable_animations=true
          path: profile/streak.svg
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit streak stats
        run: |
          git add profile/streak.svg

          if git diff --cached --quiet -- profile/streak.svg; then
            echo "No streak SVG changes to commit."
            exit 0
          fi

          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git commit -m "Update streak stats"
          git push
```

The `options` input accepts either a query string, as shown above, or a JSON object string.

## Commit Step Example

Use a guarded commit step so scheduled runs do not fail when the SVG has not changed.

```yaml
- name: Commit streak stats
  run: |
    git add profile/streak.svg

    if git diff --cached --quiet -- profile/streak.svg; then
      echo "No streak SVG changes to commit."
      exit 0
    fi

    git config user.name "github-actions[bot]"
    git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
    git commit -m "Update streak stats"
    git push
```

## Private Contributions Token Note

The default token example is `secrets.GITHUB_TOKEN`, which is enough for public contribution calendar data available to the workflow.

For private contribution counts, pass a personal access token from the measured GitHub user as a repository secret, for example `GH_STATS_TOKEN`, then set:

```yaml
token: ${{ secrets.GH_STATS_TOKEN }}
```

Private contributions are aggregate counts, not a proof of open-source activity.

## README Image Example

After the workflow commits `profile/streak.svg`, reference it from your profile or project README:

```markdown
![GitHub streak stats](profile/streak.svg)
```

## Supported Options

| Option | Default | Current behavior |
| --- | --- | --- |
| `user` | `GITHUB_REPOSITORY_OWNER` if available | GitHub username to measure. Non-alphanumeric and non-hyphen characters are removed. The action fails if no username is available. |
| `theme` | `default` | Theme name. Supported themes are `default`, `dark`, `highcontrast`, and `radical`. Unknown themes fall back to `default`. |
| `type` | `svg` | Output type. Only `svg` is supported; any other value fails the action. |
| `hide_border` | `false` | Hides the card border when true. |
| `border_radius` | `4.5` | Positive card border radius. Invalid or non-positive values use the default. |
| `background` | Theme value | Card background color override. Values without `#` are treated as hex colors; `transparent`, `url(...)`, and comma-based values are passed through. |
| `border` | Theme value | Card border color override. |
| `stroke` | Theme value | Divider and current-streak ring background stroke color override. |
| `ring` | Theme value | Current-streak ring color override. |
| `fire` | Theme value | Flame icon color override. |
| `currStreakNum` | Theme value | Current-streak number color override. |
| `sideNums` | Theme value | Total and longest streak number color override. |
| `currStreakLabel` | Theme value | Current-streak label color override. |
| `sideLabels` | Theme value | Total and longest streak label color override. |
| `dates` | Theme value | Date and range text color override. |
| `excludeDaysLabel` | Theme value | Color of the excluded-days note rendered at the bottom-left when `exclude_days` is set (daily mode only). |
| `date_format` | Locale default date format | Custom date format. Supported tokens are `Y`, `M`, `n`, `j`, and `d`; this is not a full date-fns or Moment format parser. Bracketed text is included for single dates and for rendered ranges that include a year; it is omitted for same-year ranges. |
| `locale` | `en` | Locale used for number formatting and default date formatting. |
| `short_numbers` | `false` | Uses compact number formatting when true. |
| `mode` | `daily` | Streak mode. Use `daily` or `weekly`; only the exact value `weekly` switches to weekly mode. |
| `exclude_days` | Empty | Daily mode only. Comma-separated weekdays such as `Sat,Sun` or full names. Excluded inactive days do not break an in-progress daily streak, but they do not start a streak by themselves. |
| `disable_animations` | `false` | Disables the card's fade-in and current-streak number animations when true. Animations are pure CSS and run inside a README `<img>` embed (no external dependency). |
| `card_width` | `495` | Positive SVG width. Invalid or non-positive values use the default. |
| `card_height` | `195` | Positive SVG height. Invalid or non-positive values use the default. |
| `hide_total_contributions` | `false` | Hides the total contributions section when true. |
| `hide_current_streak` | `false` | Hides the current streak section when true. |
| `hide_longest_streak` | `false` | Hides the longest streak section when true. |
| `starting_year` | Current UTC year | First contribution calendar year to fetch. The action fetches through the current UTC year. Only positive numbers are used; invalid or non-positive values are ignored. |

Boolean options are true only for `1`, `true`, `yes`, or `on`, case-insensitive.

## License

MIT License. See [LICENSE](LICENSE).
