# Contributing

Thanks for helping improve GitHub README Streak Stats.

## Development Setup

Use Node.js 24 or newer.

```sh
npm ci
```

## Local Verification

Run the full verification command before opening a pull request:

```sh
npm run verify
```

This command runs TypeScript checks, tests, and a production build.

You can also run individual steps while developing:

```sh
npm run typecheck
npm test
npm run build
```

## GitHub Action Bundle

This is a JavaScript GitHub Action. The built action bundle in `dist/` is
committed to the repository because `action.yml` runs `dist/index.js`.

When source files, dependencies, or build behavior change:

1. Run `npm run build`.
2. Commit the updated `dist/` files with the source changes.
3. Run `npm run verify` before opening the pull request.

CI checks that `dist/` is up to date. Pull requests that change source behavior
without the matching built bundle will fail.

## Pull Request Guidelines

- Keep changes focused.
- Update README examples or supported options when user-facing behavior changes.
- Add or update tests for behavior changes.
- Do not commit generated output from local smoke tests, such as files under
  `tmp/`.
- Redact tokens and private repository names from logs, screenshots, and issue
  descriptions.

## Reporting Issues

For bugs, include:

- The action version or commit SHA.
- The relevant workflow YAML with secrets redacted.
- The `options` and `path` inputs used.
- The error message or generated output you expected to see.

For security vulnerabilities, follow the process in `SECURITY.md` instead of
opening a public issue.
