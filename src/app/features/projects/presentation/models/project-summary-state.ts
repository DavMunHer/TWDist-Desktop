/**
 * Lightweight state for project summary data (sidebar).
 *
 * Holds the pending-task counts that come from the "list all projects"
 * endpoint so the sidebar can display them without loading full project
 * details.  Kept separate from {@link ProjectState} to avoid polluting
 * the main project state with sidebar-specific data.
 */
export interface ProjectSummaryState {
  /** Pending task counts indexed by project ID */
  pendingCounts: Record<string, number>;
}

export const initialProjectSummaryState: ProjectSummaryState = {
  pendingCounts: {},
};
