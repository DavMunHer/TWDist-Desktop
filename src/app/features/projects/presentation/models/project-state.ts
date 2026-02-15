import { Project } from '../../domain/entities/project.entity';

/**
 * Normalized state for all projects, keyed by ID.
 *
 * Each project holds `sectionIds` pointing into the SectionStore's dictionary.
 * Sections and tasks live in their own dedicated stores.
 *
 * @see README.md — "State Handling" section for a full explanation.
 */
export interface ProjectState {
  /** All loaded projects indexed by ID */
  projects: Record<string, Project>;
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
  selectedProjectId: null,
  loading: false,
  error: null,
};

