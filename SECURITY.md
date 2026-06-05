# Security Policy

## Supported Versions

Security fixes are provided for the latest major GitHub Action tag and the
default branch.

| Version | Supported |
| --- | --- |
| `v2` | Yes |
| `v1` | No |

## Reporting a Vulnerability

Please do not report security vulnerabilities in public issues, discussions, or
pull requests.

Use GitHub's private vulnerability reporting for this repository when available.
If private reporting is not available, contact the maintainer through their
GitHub profile and include only enough information to arrange a private
disclosure channel. Do not include secrets, personal access tokens, or full
workflow logs in a public message.

Helpful reports include:

- Affected action version or commit SHA.
- A short description of the impact.
- Minimal reproduction steps.
- Relevant workflow configuration with secrets redacted.
- Whether the issue affects `GITHUB_TOKEN`, personal access tokens, generated
  SVG/JSON output, or repository write access.

The maintainer will acknowledge valid reports as soon as practical, investigate
the issue, and coordinate a fix before public disclosure.

## Token Handling

This action accepts a GitHub token to read contribution data and write generated
output through the caller's workflow.

Use the least-privileged token that works for your workflow:

- Prefer `${{ secrets.GITHUB_TOKEN }}` for public contribution data.
- Use a personal access token only when private contribution counts are needed.
- Store personal access tokens as repository or organization secrets.
- Do not commit tokens, print tokens, or paste unredacted workflow logs into
  issues.
- Limit workflow permissions to the minimum required permissions. The README
  examples use `contents: write` only for the commit step that writes generated
  output back to the repository.

Private contribution counts are aggregate counts. They should not be treated as
proof of private repository activity.
