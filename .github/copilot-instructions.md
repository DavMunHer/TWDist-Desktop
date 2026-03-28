# Copilot CI Quality Gate

For every Angular change, Copilot must verify CI health before suggesting code as ready or marking a plan/task complete.

Definition of Done for all code changes:
- Build passes: `npm run build` (or project-equivalent production build command).
- Unit tests pass: `npm test -- --watch=false` (or project-equivalent non-watch test command).
- Lint passes with zero errors: `npm run lint`.

Mandatory behavior:
- Do not report completion if any build, test, or lint step fails.
- Prioritize fixing CI failures before additional feature work.
- Prefer validating via `act -W .github/workflows/ci.yml -j build-and-test` when available; otherwise run the equivalent npm commands locally.
