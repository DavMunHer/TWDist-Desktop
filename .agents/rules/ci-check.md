# Antigravity CI Check Rule

All tasks must satisfy the following Definition of Done before they are reported as complete:
- Green pipeline pass using `act -W .github/workflows/ci.yml -j build-and-test`, or
- Equivalent local npm verification with successful build, tests, and lint.

Required checks:
- Build succeeds.
- Tests pass.
- Lint reports zero errors.

If any check fails, fix the issue first and rerun verification.
