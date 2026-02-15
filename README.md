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

## State Handling — Normalized Store

### Why normalized?

Our UI has a tree-shaped data model: **Projects → Sections → Tasks**.
A naïve approach would nest them (`Project.sections[].tasks[]`), but that causes two problems:

1. **Expensive updates** — changing a single task forces you to spread/clone the entire project and every section above it.
2. **Duplicated data** — if the same task appears in more than one view (e.g. "today" list), you'd have to keep copies in sync.

Instead, we flatten the tree into **three dictionaries** keyed by ID and express relationships as ID arrays.

### State shape

```
ProjectState
├── projects:          Record<string, Project>   // keyed by project ID
├── sections:          Record<string, Section>   // keyed by section ID
├── tasks:             Record<string, Task>      // keyed by task ID
├── selectedProjectId: string | null
├── loading:           boolean
└── error:             string | null
```

Each entity stores only the IDs of its children:

| Entity    | Relationship field | Points to   |
|-----------|--------------------|-------------|
| `Project` | `sectionIds`       | `Section[]` |
| `Section` | `taskIds`          | `Task[]`    |

### How it works in practice

**Writing (actions/mutations):**

When the store needs to update the state, it only touches the affected dictionary — no deep cloning needed.

```ts
// Toggle a task → only the tasks dictionary is touched
this.state.update(s => ({
  ...s,
  tasks: { ...s.tasks, [updatedTask.id]: updatedTask },
}));

// Add a section → update project's sectionIds + add a section entry
this.state.update(s => ({
  ...s,
  projects: {
    ...s.projects,
    [projectId]: project.addSection(section.id),
  },
  sections: { ...s.sections, [section.id]: section },
}));
```

**Reading (selectors / computed signals):**

The `ProjectStore` exposes a `projectView` computed signal that reconstructs the tree on‑the‑fly for the template:

```ts
readonly projectView = computed<ProjectViewModel | null>(() => {
  const project = this.selectedProject();
  if (!project) return null;

  const { sections, tasks } = this.state();

  return {
    id: project.id,
    name: project.name,
    sections: project.sectionIds
      .map(sId => sections[sId])
      .filter(Boolean)
      .map(section => ({
        id: section.id,
        name: section.name,
        tasks: section.taskIds
          .map(tId => tasks[tId])
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
```

Because this is a standard Angular `computed()` signal, the template will only re-render when the underlying data actually changes.

### Data flow

```
API Response (nested JSON)
        │
        ▼
   ProjectMapper.toAggregate()   ← normalizes into { project, sections[], tasks[] }
        │
        ▼
   ProjectStore.loadProject()    ← merges into the flat dictionaries
        │
        ▼
   projectView (computed)        ← denormalizes into ProjectViewModel tree
        │
        ▼
   Template                      ← renders the tree
```

### Rules of thumb

1. **Domain entities stay in the store** — `Project`, `Section`, and `Task` domain classes are used directly in the state. DTOs only exist at the infrastructure boundary.
2. **View-models are derived** — never store a `ProjectViewModel` in the state. Let `computed()` build it from the normalized data.
3. **Components call store actions** — components should never subscribe to use-cases directly. Instead, call store methods (`createSection()`, `toggleTaskCompletion()`) and let the store handle the subscription + state update.
4. **Immutable updates only** — always produce a new object via spread (`{ ...s, ... }`). Domain entity methods like `project.addSection()` already return new instances.