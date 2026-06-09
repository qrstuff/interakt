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
