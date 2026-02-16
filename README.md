# TWDist - Desktop version

This project is for creating the client-side desktop version of the TWDist app (ToDo-List app), made with Angular 19 and Electron

## Installation and configuration

1. Download this project and go to the dowloaded folder:
```sh
git clone https://github.com/DavMunHer/TWDist-Desktop
cd TWDist-desktop
```

2. Dowload the project dependencies:
```sh
npm install
# or
bun install
```

## Start developing!
For starting developing in this project you can just run `bun run start` and it will automatically start a new Electron app with the content of the Angular app.

---

## State Handling — Normalized Store with Separated Stores

### Why normalized?

Our UI has a tree-shaped data model: **Projects → Sections → Tasks (→ Subtasks)**.
A naïve approach would nest them (`Project.sections[].tasks[].subtasks[]`), but that causes two problems:

1. **Expensive updates** — changing a single task forces you to spread/clone the entire project and every section above it.
2. **Duplicated data** — if the same task appears in more than one view (e.g. "today" list), you'd have to keep copies in sync.

Instead, we flatten the tree into **three separate stores**, each owning a flat dictionary keyed by ID. Relationships are expressed as ID arrays inside the entities.

### Architecture: Three Stores

```
┌─────────────────────────────────────────────────────┐
│                   ProjectStore                       │
│  State: Record<string, Project>                      │
│  Owns: selectedProjectId, loading, error             │
│  Exposes: projectView (computed, reads all 3 stores) │
├─────────────────────────────────────────────────────┤
│                   SectionStore                       │
│  State: Record<string, Section>                      │
│  Owns: section CRUD, addTaskToSection                │
├─────────────────────────────────────────────────────┤
│                    TaskStore                          │
│  State: Record<string, Task>                         │
│  Owns: task CRUD, subtask CRUD, toggleCompletion     │
└─────────────────────────────────────────────────────┘
```

**Why separate stores instead of one big store?**

- **Single responsibility** — each store only knows how to mutate its own entity type.
- **Scalability** — adding task features (drag, reorder, filters) only touches `TaskStore`.
- **Testability** — stores can be unit-tested in isolation.
- **No circular deps** — `TaskStore` knows nothing about projects. `SectionStore` knows nothing about projects. Only `ProjectStore` orchestrates across all three.

### State shapes

Each store has its own state interface:

```
ProjectState                       SectionState                    TaskState
├── projects: Record<id, Project>  ├── sections: Record<id, Section>  ├── tasks: Record<id, Task>
├── selectedProjectId: string|null ├── loading: boolean               ├── loading: boolean
├── loading: boolean               └── error: string|null             └── error: string|null
└── error: string|null
```

### Entity relationships (ID arrays)

| Entity    | Field          | Points to      |
|-----------|----------------|----------------|
| `Project` | `sectionIds`   | `Section[]`    |
| `Section` | `taskIds`      | `Task[]`       |
| `Task`    | `subtaskIds`   | `Task[]`       |
| `Task`    | `parentTaskId` | parent `Task`  |

### How stores communicate

When an action spans multiple entities, the **ProjectStore** acts as the orchestrator:

```ts
// ProjectStore.createTask() — orchestrates SectionStore + TaskStore:
createTask(sectionId: string, taskName: string): void {
  this.taskStore.createTask(sectionId, taskName, (task) => {
    this.sectionStore.addTaskToSection(sectionId, task.id);
  });
}
```

The callback pattern ensures atomic updates: the section only gets the new task ID after the task is confirmed created.

### Subtask support

Subtasks are simply tasks with a `parentTaskId` and live in the same flat `TaskStore.tasks` dictionary. The parent task holds `subtaskIds: string[]` pointing to its children. The `projectView` computed selector recursively builds the tree:

```ts
const buildTaskTree = (taskIds: readonly string[]): TaskViewModel[] =>
  taskIds
    .map(tId => tasks[tId])
    .filter(Boolean)
    .map(task => ({
      id: task.id,
      name: task.name,
      completed: task.completed,
      startDate: task.startDate,
      subtasks: buildTaskTree(task.subtaskIds),  // ← recursive
    }));
```

### Data flow

```
API Response (nested JSON)
        │
        ▼
   ProjectMapper.toAggregate()       ← normalizes { project, sections[], tasks[] }
        │                              (TaskMapper.flattenToDomain recursively
        │                               flattens subtasks into the tasks array)
        ▼
   ProjectStore.loadProject()
        ├── sectionStore.mergeSections(sections)
        ├── taskStore.mergeTasks(tasks)
        └── own state: projects[id] = project
        │
        ▼
   projectView (computed)            ← reads ProjectStore + SectionStore + TaskStore
        │                              denormalizes into ProjectViewModel tree
        ▼
   Template                          ← renders sections → tasks → subtasks
```

### Rules of thumb

1. **Domain entities stay in the store** — `Project`, `Section`, and `Task` domain classes are used directly in the state. DTOs only exist at the infrastructure boundary.
2. **View-models are derived** — never store a `ProjectViewModel` in the state. Let `computed()` build it from the normalized data.
3. **Components call ProjectStore actions** — components should never subscribe to use-cases directly. Instead, call `ProjectStore` methods which orchestrate across stores.
4. **Immutable updates only** — always produce a new object via spread (`{ ...s, ... }`). Domain entity methods like `project.addSection()` and `task.addSubtask()` already return new instances.
5. **One store per entity type** — never put section data into `ProjectState` or task data into `SectionState`. Each store owns exactly one `Record<string, Entity>` dictionary.