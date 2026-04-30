import { computed, inject, Injectable } from '@angular/core';
import { SectionStore } from '@features/projects/presentation/store/section.store';
import { TaskStore } from '@features/projects/presentation/store/task.store';
import {
  TaskDeleteEvent,
  TaskEditEvent,
  TaskRenameEvent,
  TaskToggleEvent,
  TaskViewModel,
} from '@features/projects/presentation/models/project.view-model';
import { TodayGroupViewModel, TodayTaskViewModel } from '@features/today/presentation/models/today.view-model';

/**
 * Read-only store for the Today view.
 *
 * Derives today's tasks from the already-loaded TaskStore/SectionStore data,
 * grouping them by day label (string). Task mutations
 * are delegated directly to TaskStore and SectionStore using the correct
 * projectId resolved from the section metadata.
 *
 * Note: only tasks from projects that have been fully loaded (via
 * ProjectStore.loadProject) appear here. A future backend endpoint for
 * cross-project today queries can replace the computed() signal below.
 */
@Injectable({ providedIn: 'root' })
export class TodayStore {
  private readonly sectionStore = inject(SectionStore);
  private readonly taskStore = inject(TaskStore);

  // ===================================================================
  // SELECTORS
  // ===================================================================

  /**
   * Today's tasks grouped by day label.
   * A task is "today" when its endDate falls on the current calendar day.
   */
  readonly todayGroups = computed<TodayGroupViewModel[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = this.taskStore.tasks();
    const dayGroups = new Map<string, TodayTaskViewModel[]>();

    for (const task of Object.values(tasks)) {
      // Only root tasks (no parent) and only those due today
      if (task.parentTaskId) continue;
      if (!task.endDate) continue;

      const dueDate = new Date(task.endDate);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate < today || dueDate >= tomorrow) continue;

      const label = this.dayLabelForDate(dueDate, today);

      const taskVM: TodayTaskViewModel = {
        id: task.id,
        sectionId: task.sectionId,
        name: task.name,
        completed: task.completed,
        startDate: task.startDate,
        description: task.description,
        endDate: task.endDate,
        subtasks: this.buildSubtaskTree(task.subtaskIds, tasks),
      };

      const existing = dayGroups.get(label);
      if (existing) {
        existing.push(taskVM);
      } else {
        dayGroups.set(label, [taskVM]);
      }
    }

    return Array.from(dayGroups.entries()).map(([dayLabel, groupedTasks]) => ({
      label: dayLabel,
      tasks: groupedTasks,
    }));
  });

  // ===================================================================
  // ACTIONS — delegated to TaskStore / SectionStore
  // ===================================================================

  toggleTaskCompletion(event: TaskToggleEvent): void {
    const projectId = this.resolveProjectId(event.id);
    if (!projectId) return;
    this.taskStore.toggleTaskCompletion(projectId, event.id);
  }

  renameTask(event: TaskRenameEvent): void {
    const projectId = this.resolveProjectId(event.id);
    if (!projectId) return;
    this.taskStore.updateTaskName(projectId, event.id, event.name);
  }

  deleteTask(event: TaskDeleteEvent): void {
    const projectId = this.resolveProjectId(event.id);
    if (!projectId) return;
    this.taskStore.deleteTask(projectId, event.sectionId, event.id, () => {
      this.sectionStore.removeTaskFromSection(event.sectionId, event.id);
    });
  }

  editTask(event: TaskEditEvent): void {
    const projectId = this.resolveProjectId(event.id);
    if (!projectId) return;
    this.taskStore.editTask(
      projectId,
      event.id,
      event.name,
      event.description,
      event.startDate,
      event.endDate,
    );
    if (event.completedChanged) {
      this.taskStore.toggleTaskCompletion(projectId, event.id);
    }
  }

  // ===================================================================
  // HELPERS
  // ===================================================================

  private resolveProjectId(taskId: string): string | undefined {
    const task = this.taskStore.getTask(taskId);
    if (!task) return undefined;
    const section = this.sectionStore.getSection(task.sectionId);
    return section?.projectId;
  }

  private buildSubtaskTree(
    subtaskIds: readonly string[],
    tasks: ReturnType<typeof this.taskStore.tasks>,
  ): TaskViewModel[] {
    return subtaskIds
      .map(id => tasks[id])
      .filter(Boolean)
      .map(subtask => ({
        id: subtask.id,
        name: subtask.name,
        completed: subtask.completed,
        startDate: subtask.startDate,
        description: subtask.description,
        endDate: subtask.endDate,
        subtasks: this.buildSubtaskTree(subtask.subtaskIds, tasks),
      }));
  }

  private dayLabelForDate(date: Date, today: Date): string {
    if (date.getTime() === today.getTime()) return 'Today';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }
}
