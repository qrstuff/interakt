# AGENTS.md

This file defines the working rules for agents making changes in this repository.

## Scope

These rules apply to all file changes in this project unless the user explicitly instructs otherwise.

## Change Rules

1. After any turn that includes file modifications, run:

```bash
npx prettier . --write
```

2. For every feature addition, removal, or behavior change, ensure there is appropriate unit test coverage.

3. Unit tests must pass for the relevant change set before the work is considered complete.

4. End-to-end coverage must be maintained. Update or add Playwright e2e tests when behavior changes affect user flows.

5. E2e tests must pass after changes before the work is considered complete.

6. Keep `docs/index.html` and `tests/e2e/site/index.html` in sync. Their implementation and visible behavior should match, with only the library loading mechanism differing:

   - `docs/index.html` should load the published library from `unpkg`
   - `tests/e2e/site/index.html` should load the local library source for testability

7. Keep `README.md` in sync with the public API. Whenever options or built-in conditions are added, removed, renamed, or have argument/behavior changes, update the README documentation for:

   - available options
   - each built-in condition
   - condition arguments and defaults
   - any changed behavior semantics

8. When asked to bump a version, perform the full release-version update workflow:
   - set that version in `package.json`
   - update the version in the CDN URL in the `CDN Usage` section of `README.md`
   - update the version in the CDN URL in `docs/index.html`
   - create a git commit with message `Bump to <version>`
   - run `git push`
   - create tag `v<version>`
   - run `git push origin v<version>`

## Minimum Verification After File Changes

After file changes, run at minimum:

```bash
npx prettier . --write
npm test
npm run test:e2e
```

If the change can affect typing or build output, also run:

```bash
npm run typecheck
npm run build
```

## Testing Standard

- Do not leave behavior changes without corresponding automated tests.
- Prefer focused unit tests for logic and state transitions.
- Maintain e2e tests for user-visible flows and integration behavior.
- If a test cannot be updated or run, call that out explicitly in the final handoff.
