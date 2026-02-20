import { computed, inject, Injectable, signal } from '@angular/core';
import {
  initialProjectSummaryState,
  ProjectSummaryState,
} from '../models/project-summary-state';
import { SectionStore } from './section.store';
import { TaskStore } from './task.store';

/**
 * Store for sidebar-specific **project summary** data.
 *
 * Owns the pending-task counts returned by the "list all projects" endpoint
 * and provides a helper to resolve the count for a given project — using the
 * cached API value when available, or computing it on-the-fly from the
 * loaded sections / tasks.
 *
 * Deliberately kept separate from {@link ProjectStore} so the main project
 * state is not polluted with sidebar-only concerns.
 */
@Injectable({ providedIn: 'root' })
export class ProjectSummaryStore {
  private readonly sectionStore = inject(SectionStore);
  private readonly taskStore = inject(TaskStore);

  private readonly state = signal<ProjectSummaryState>(
    initialProjectSummaryState,
  );

  // ===================================================================
  // SELECTORS
  // ===================================================================

  readonly pendingCounts = computed(() => this.state().pendingCounts);

  /**
   * Resolve the pending-task count for a single project.
   *
   * Returns the cached API count when present; otherwise walks the
   * project's sections and tasks to compute it.  Safe to call inside
   * a `computed()` — all signal reads are tracked automatically.
   */
  pendingCountFor(
    projectId: string,
    sectionIds: readonly string[],
  ): number {
    const cached = this.state().pendingCounts[projectId];
    if (cached !== undefined) return cached;

    const sections = this.sectionStore.sections();
    const tasks = this.taskStore.tasks();

    let count = 0;
    for (const sectionId of sectionIds) {
      const section = sections[sectionId];
      if (!section) continue;

      for (const taskId of section.taskIds) {
        const task = tasks[taskId];
        if (task && !task.completed) count++;
      }
    }
    return count;
  }

  // ===================================================================
  // ACTIONS
  // ===================================================================

  /** Merge API-provided pending counts into the store */
  mergePendingCounts(counts: Record<string, number>): void {
    this.state.update(s => ({
      ...s,
      pendingCounts: { ...s.pendingCounts, ...counts },
    }));
  }
}
