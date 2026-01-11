# Clean Architecture Implementation

This project follows **Clean Architecture** principles with a **feature-based organization**.

## Architecture Overview

```
features/
├── projects/              # Projects feature module
│   ├── domain/           # Business logic (pure TypeScript)
│   │   ├── entities/     # Domain models (Project, Section, Task)
│   │   └── repositories/ # Repository interfaces (ports)
│   ├── application/      # Use cases / Application services
│   │   └── use-cases/    # Business operations
│   ├── infrastructure/   # External concerns
│   │   ├── dto/         # Data Transfer Objects
│   │   ├── mappers/     # DTO <-> Entity mappers
│   │   └── repositories/ # Repository implementations
│   └── presentation/     # UI layer
│       ├── models/       # View models
│       └── store/        # State management
└── shared/               # Shared utilities
```

## Layer Responsibilities

### 1. Domain Layer (`domain/`)
**Pure business logic - No framework dependencies**

- **Entities**: Immutable domain models with business rules
  - `Project`, `Section`, `Task`
  - Pure TypeScript classes
  - Business methods (e.g., `task.complete()`, `project.addSection()`)

- **Repository Interfaces**: Abstract contracts for data access
  - Define what operations are needed
  - No implementation details

**Key principle**: Domain has ZERO dependencies on Angular or external libraries.

### 2. Application Layer (`application/`)
**Orchestration of business operations**

- **Use Cases**: Single-purpose application operations
  - `LoadProjectUseCase`
  - `CreateSectionUseCase`
  - `CreateTaskUseCase`
  - `ToggleTaskCompletionUseCase`

- Each use case:
  - Depends on repository interfaces (not implementations)
  - Contains application-specific logic
  - Returns domain entities

### 3. Infrastructure Layer (`infrastructure/`)
**Implementation of external concerns**

- **DTOs**: API response/request models
- **Mappers**: Convert between DTOs and domain entities
- **Repository Implementations**: Actual HTTP calls
  - `HttpProjectRepository`
  - `HttpSectionRepository`
  - `HttpTaskRepository`

### 4. Presentation Layer (`presentation/`)
**UI-specific concerns**

- **View Models**: UI-optimized data structures
- **Stores**: State management using Angular signals
- **Components**: Live in `components/` directory

## Dependency Flow

```
Presentation → Application → Domain ← Infrastructure
```

**The Dependency Rule**: Dependencies point inward. Inner layers know nothing about outer layers.

- Domain knows about: Nothing (pure business logic)
- Application knows about: Domain
- Infrastructure knows about: Domain
- Presentation knows about: Application, Domain

## Dependency Injection

All dependencies are wired in `projects.providers.ts`:

```typescript
export const PROJECT_FEATURE_PROVIDERS: Provider[] = [
  // Repositories (inject interfaces, provide implementations)
  { provide: ProjectRepository, useClass: HttpProjectRepository },
  { provide: SectionRepository, useClass: HttpSectionRepository },
  { provide: TaskRepository, useClass: HttpTaskRepository },
  
  // Use Cases
  LoadProjectUseCase,
  CreateSectionUseCase,
  // ...
  
  // Presentation
  ProjectStore,
];
```

Registered in [app.config.ts](../app.config.ts):
```typescript
providers: [
  ...PROJECT_FEATURE_PROVIDERS,
]
```

## How to Use

### In Components

```typescript
@Component({...})
export class ProjectViewComponent {
  private projectStore = inject(ProjectStore);
  
  projectInfo = computed(() => this.projectStore.projectView());
  
  ngOnInit() {
    this.projectStore.loadProject('1');
  }
}
```

### In Store

```typescript
@Injectable()
export class ProjectStore {
  private loadProjectUseCase = inject(LoadProjectUseCase);
  
  loadProject(projectId: string) {
    this.loadProjectUseCase.execute(projectId).subscribe({
      next: ({ project, sections, tasks }) => {
        // Update state
      }
    });
  }
}
```

### In Use Cases

```typescript
@Injectable()
export class LoadProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}
  
  execute(projectId: string): Observable<ProjectAggregate> {
    return this.projectRepository.findById(projectId);
  }
}
```

## Benefits

✅ **Testability**: Domain logic testable without Angular
✅ **Maintainability**: Clear separation of concerns
✅ **Flexibility**: Easy to swap implementations (HTTP → LocalStorage)
✅ **Scalability**: Each feature is self-contained
✅ **Type Safety**: Strong typing throughout all layers
✅ **Independence**: Business logic independent of frameworks

## Testing Strategy

- **Domain**: Pure unit tests (no Angular TestBed)
- **Application**: Test use cases with mocked repositories
- **Infrastructure**: Integration tests for API calls
- **Presentation**: Component tests with mocked stores

## Adding New Features

1. Create feature directory: `features/my-feature/`
2. Define domain entities and repositories
3. Create use cases in application layer
4. Implement repositories in infrastructure
5. Create presentation store and view models
6. Wire dependencies in `my-feature.providers.ts`
7. Register in `app.config.ts`

## Migration Notes

- Old models in `models/` → Now in `features/*/domain/entities/`
- Old `ProjectApiService` → Now `HttpProjectRepository`
- Old `ProjectStoreService` → Now `ProjectStore`
- Old view types → Now in `presentation/models/`

## Next Steps

- [ ] Complete auth feature with same structure
- [ ] Add unit tests for domain entities
- [ ] Add integration tests for repositories
- [ ] Implement error handling strategy
- [ ] Add loading states to store
- [ ] Remove deprecated files from old structure
