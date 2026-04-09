import { ProjectOutput } from '@features/projects/application/dtos/project-output';
import { UiError } from '@features/projects/presentation/models/ui-error';

/**
 * Normalized state for all projects, keyed by ID.
 *
 * Each project holds `sectionIds` pointing into the SectionStore's dictionary.
 * Sections and tasks live in their own dedicated stores.
 *
 * Sidebar-specific data (pending task counts) lives in
 * {@link ProjectSummaryState} to keep this state focused on core project data.
 *
 * @see README.md — "State Handling" section for a full explanation.
 */
export interface ProjectState {
  /** All loaded projects indexed by ID */
  projects: Record<string, ProjectOutput>;
  /** Currently selected / active project ID */
  selectedProjectId: string | null;
  /** Whether a data operation is in progress */
  loading: boolean;
  /** Last error message, if any */
  error: string | null;
  /** Rich error details for UI rendering (field messages, retryability, kind). */
  errorDetails: UiError | null;
}

/** Convenience factory for producing the initial (empty) state */
export const initialProjectState: ProjectState = {
  projects: {},
  selectedProjectId: null,
  loading: false,
  error: null,
  errorDetails: null,
};

