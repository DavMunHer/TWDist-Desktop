# Vitest Templates

These files are starter templates for common Angular unit test patterns in this project.

## Available templates

- component-template.spec.ts
  - Use for standalone component tests with TestBed and fixture assertions.
  - Good for checking rendered output, inputs, outputs, and component state.

- service-template.spec.ts
  - Use for service tests with dependency injection and signal/state assertions.
  - Good for pure service behavior and state transitions.

- http-service-template.spec.ts
  - Use for services that call HttpClient.
  - Includes provideHttpClientTesting + HttpTestingController flow.

## Recommended workflow

1. Copy the closest template into your target folder.
2. Rename describe blocks and test names to the feature under test.
3. Replace sample types/data with real app models.
4. Keep one behavior per test and assert only what matters for that behavior.

## Run tests

- Single run: npm test
- Watch mode: npm run test:watch

## Notes

- The current project runs only tests under src/vitest/**/*.spec.ts.
- Legacy src/**/*.spec.ts tests are intentionally excluded from the Vitest pipeline.
