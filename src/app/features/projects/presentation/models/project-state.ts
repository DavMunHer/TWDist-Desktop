import { Project } from '../../domain/entities/project.entity';
import { Section } from '../../domain/entities/section.entity';
import { Task } from '../../domain/entities/task.entity';

/**
 * Normalized state shape for the projects feature.
 *
 * Instead of deeply nesting sections inside projects and tasks inside sections,
 * each entity type lives in its own flat dictionary keyed by ID.
 * Relationships are expressed through ID arrays (Project.sectionIds, Section.taskIds).
 *
 * This makes updates O(1) for any single entity and prevents the need to
 * deep-clone an entire tree when a single task changes.
 *
 * @see README.md — "State Handling" section for a full explanation.
 */
export interface ProjectState {
  /** All loaded projects indexed by ID */
  projects: Record<string, Project>;
  /** All loaded sections indexed by ID */
  sections: Record<string, Section>;
  /** All loaded tasks indexed by ID */
  tasks: Record<string, Task>;
  /** Currently selected / active project ID */
  selectedProjectId: string | null;
  /** Whether a data operation is in progress */
  loading: boolean;
  /** Last error message, if any */
  error: string | null;
}

/** Convenience factory for producing the initial (empty) state */
export const initialProjectState: ProjectState = {
  projects: {},
  sections: {},
  tasks: {},
  selectedProjectId: null,
  loading: false,
  error: null,
};

