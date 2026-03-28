# Universal Agent Quality Gate

This repository enforces CI verification across all agents (Copilot, Cursor, Antigravity, and any other automation).

Definition of Done:
- A green verification pass via `act -W .github/workflows/ci.yml -j build-and-test`, or
- A fully successful equivalent local npm run of build, tests, and lint.

Completion rules:
- No task may be marked complete if build, tests, or lint fails.
- Resolve failures and rerun checks until all gates are green.
