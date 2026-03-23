# Clean Architecture Implementation

This project follows **Clean Architecture** principles with a **feature-based organization**.

## Architecture Overview

```
src/app/
├── features/
│   └── projects/              # Projects feature module
│       ├── domain/           # Business logic (pure TypeScript)
│       │   ├── entities/     # Domain models (Project, Section, Task)
│       │   └── repositories/ # Repository interfaces (ports)
│       ├── application/      # Use cases / Application services
│       │   └── use-cases/    # Business operations
│       ├── infrastructure/   # External concerns
│       │   ├── dto/         # Data Transfer Objects
│       │   ├── mappers/     # DTO <-> Entity mappers
│       │   └── repositories/ # Repository implementations
│       └── presentation/     # UI layer
│           ├── models/       # View models
│           └── store/        # State management
├── components/               # UI Components (presentation only)
│   ├── auth/                # Authentication components
│   └── home/                # Home and project views
├── directives/              # Shared directives
└── shared/                  # Shared utilities
    └── utils/               # Helper functions
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
  - `ProjectViewModel`, `SectionViewModel`, `TaskViewModel`
  - Simplified versions of domain entities for display
  - Located in `features/*/presentation/models/`
  
- **Stores**: State management using Angular signals
  - `ProjectStore` - Manages project state and coordinates use cases
  - Exposes computed signals for reactive UI updates
  - Located in `features/*/presentation/store/`
  
- **Components**: UI components that consume view models
  - Located in `components/` directory
  - Import view models from feature's presentation layer
  - Inject stores for state management

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

Registered in [app.config.ts](src/app/app.config.ts):
```typescript
import { provideHttpClient } from '@angular/common/http';
import { PROJECT_FEATURE_PROVIDERS } from './features/projects/projects.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),
    ...PROJECT_FEATURE_PROVIDERS,
  ],
};
```

**Note**: Direct import from `projects.providers.ts` - no barrel files used.

## How to Use

### In Components

```typescript
import { ProjectViewModel, SectionViewModel, TaskViewModel } from '../../../features/projects/presentation/models/project.view-model';
import { ProjectStore } from '../../../features/projects/presentation/store/project.store';

@Component({...})
export class ProjectViewComponent implements OnInit {
  private projectStore = inject(ProjectStore);
  
  // Computed signal from store
  projectInfo = computed(() => this.projectStore.projectView());
  
  ngOnInit() {
    this.projectStore.loadProject('1');
  }
  
  updateTask(section: SectionViewModel, task: TaskViewModel) {
    // Use cases will be called through the store
  }
}
```

**Template usage:**
```html
<header class="project-header">
  {{projectInfo()?.name}}
</header>

<main>
  @for (section of projectInfo()?.sections; track section.id) {
    <project-section [sectionInfo]="section" />
  }
</main>
```

**Note**: Uses direct imports (no barrel files) following modern best practices.

### In Store

```typescript
import { computed, inject, Injectable, signal } from '@angular/core';
import { LoadProjectUseCase } from '../../application/use-cases/load-project/load-project.use-case';
import { Project } from '../../domain/entities/project.entity';
import { Section } from '../../domain/entities/section.entity';
import { Task } from '../../domain/entities/task.entity';
import { ProjectViewModel } from '../models/project.view-model';

@Injectable()
export class ProjectStore {
  private loadProjectUseCase = inject(LoadProjectUseCase);

  private readonly state = signal<ProjectState>({
    project: null,
    sections: {},
    tasks: {},
  });

  // Computed view model for UI consumption
  readonly projectView = computed<ProjectViewModel | null>(() => {
    const { project, sections, tasks } = this.state();
    if (!project) return null;

    return {
      id: project.id,
      name: project.name,
      sections: project.sectionIds
        .map(id => sections[id])
        .filter(Boolean)
        .map(section => ({
          id: section.id,
          name: section.name,
          tasks: section.taskIds
            .map(id => tasks[id])
            .filter(Boolean)
            .map(task => ({
              id: task.id,
              name: task.name,
              completed: task.completed,
              startDate: task.startDate,
            })),
        })),
    };
  });
  
  loadProject(projectId: string) {
    this.loadProjectUseCase.execute(projectId).subscribe({
      next: ({ project, sections, tasks }) => {
        this.state.set({
          project,
          sections: this.toRecord(sections),
          tasks: this.toRecord(tasks),
        });
      }
    });
  }

  private toRecord<T extends { id: string }>(items: T[]): Record<string, T> {
    return items.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<string, T>);
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
✅ **No Barrel Files**: Direct imports for better tree-shaking and clarity  
✅ **Smaller Bundles**: Only import what you need

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

## Migration Status

### ✅ Completed
- ✅ Created clean architecture structure in `features/projects/`
- ✅ Implemented domain entities (Project, Section, Task)
- ✅ Created repository interfaces and implementations
- ✅ Implemented use cases (LoadProject, CreateSection, CreateTask, ToggleTaskCompletion)
- ✅ Created presentation layer with view models and store
- ✅ Migrated all components to use new view models
- ✅ Removed deprecated directories (`core/`, `state/`, `models/`)
- ✅ Configured dependency injection in `app.config.ts`

### 📝 View Model Property Mapping
Old structure → New structure:
- `ProjectView` → `ProjectViewModel`
  - `sectionsList` → `sections`
- `SectionView` → `SectionViewModel`
  - `tasksList` → `tasks`
- `TaskView` → `TaskViewModel`
  - `taskName` → `name`

### 🗂️ Directory Migration
- `models/project.model.ts` → `features/projects/domain/entities/project.entity.ts`
- `models/section.model.ts` → `features/projects/domain/entities/section.entity.ts`
- `models/task.model.ts` → `features/projects/domain/entities/task.entity.ts`
- `models/model-views/view.types.ts` → `features/projects/presentation/models/project.view-model.ts`
- `core/api/project-api.service.ts` → `features/projects/infrastructure/repositories/http-project.repository.ts`
- `core/api/dto/` → `features/projects/infrastructure/dto/`
- `core/api/mappers/` → `features/projects/infrastructure/mappers/`
- `state/project/project-store.service.ts` → `features/projects/presentation/store/project.store.ts`
- `state/utils/normalize.ts` → `shared/utils/normalize.util.ts`

## Next Steps

- [ ] Implement remaining use cases for mutations (UpdateSection, DeleteSection, UpdateTask, DeleteTask)
- [ ] Complete auth feature with same clean architecture structure
- [ ] Add unit tests for domain entities
- [ ] Add integration tests for repositories
- [ ] Implement comprehensive error handling strategy
- [ ] Add loading and error states to store
- [ ] Implement optimistic UI updates
- [ ] Add data persistence layer (offline support)
- [ ] Create additional features following the same pattern
