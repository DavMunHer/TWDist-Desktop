# Contributing

## Running the app locally

See **[docs/local-development.md](docs/local-development.md)** for:

- Web dev (`ng serve`) against a local backend
- Electron dev (`bun run start`) with `electron/config.local.json`
- Electron preview (`bun run electron:preview`) — production-like shell
- Testing against a **remote / production API** from your machine (without committing URLs)
- Building installers locally with `TWDIST_API_BASE_URL`

Never commit `electron/config.local.json` or `electron/config.packaged.json`.

## CI before opening a PR

```bash
bunx ng test --watch=false
bun run lint
bunx ng build --configuration=production --progress=false
```

Or run the full workflow locally: `act -W .github/workflows/ci.yml -j build-and-test` (requires [act](https://github.com/nektos/act)).

## Opening a Pull Request with a Specific Template
Click below to open a PR with the correct template:

* [🚀 New Feature](../../compare?expand=1&template=feature.md)
* [🛠️ Refactor](../../compare?expand=1&template=refactor.md)
* [🎨 UI Change](../../compare?expand=1&template=ui_changes.md)
