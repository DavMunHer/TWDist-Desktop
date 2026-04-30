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
  // TODO: Remove this temporary preview data once Today is backed by real API-driven data.
  private readonly previewMockGroups: TodayGroupViewModel[] = [
    {
      label: this.dayLabelForDate(this.offsetDaysFromToday(-2), this.todayStart()),
      tasks: [
        {
          id: 'mock-older-1',
          sectionId: 'mock-section-4',
          name: 'Finalize analytics event map',
          completed: false,
          startDate: this.offsetDaysFromToday(-2),
          description: 'Temporary mock item for UI preview.',
          endDate: undefined,
          subtasks: [],
        },
      ],
    },
    {
      label: 'Yesterday',
      tasks: [
        {
          id: 'mock-yesterday-1',
          sectionId: 'mock-section-3',
          name: 'Refine onboarding copy',
          completed: false,
          startDate: this.offsetDaysFromToday(-1),
          description: 'Temporary mock item for UI preview.',
          endDate: undefined,
          subtasks: [],
        },
        {
          id: 'mock-yesterday-2',
          sectionId: 'mock-section-3',
          name: 'Plan follow-up user interviews',
          completed: false,
          startDate: this.offsetDaysFromToday(-1),
          description: 'Temporary mock item for UI preview.',
          endDate: undefined,
          subtasks: [],
        },
      ],
    },
    {
      label: 'Today',
      tasks: [
        {
          id: 'mock-today-1',
          sectionId: 'mock-section-1',
          name: 'Prepare sprint demo notes',
          completed: false,
          startDate: new Date(),
          description: 'Temporary mock item for UI preview.',
          endDate: undefined,
          subtasks: [],
        },
        {
          id: 'mock-today-2',
          sectionId: 'mock-section-1',
          name: 'Review pull request feedback',
          completed: true,
          startDate: new Date(),
          description: 'Temporary mock item for UI preview.',
          endDate: undefined,
          subtasks: [],
        },
        {
          id: 'mock-today-3',
          sectionId: 'mock-section-2',
          name: 'Write QA checklist for release',
          completed: false,
          startDate: new Date(),
          description: 'Temporary mock item for UI preview.',
          endDate: undefined,
          subtasks: [],
        },
      ],
    },
  ];

  // ===================================================================
  // SELECTORS
  // ===================================================================

  /**
   * Today's tasks grouped by day label.
   * Tasks are grouped by startDate day label.
   */
  readonly todayGroups = computed<TodayGroupViewModel[]>(() => {
    const today = this.todayStart();

    const tasks = this.taskStore.tasks();
    const dayGroups = new Map<number, { label: string; tasks: TodayTaskViewModel[] }>();

    for (const task of Object.values(tasks)) {
      // Only root tasks with an explicit start date.
      if (task.parentTaskId) continue;
      if (!task.startDate) continue;

      const startDate = new Date(task.startDate);
      startDate.setHours(0, 0, 0, 0);

      // "Today" view shows only tasks starting today or in the past.
      if (startDate > today) continue;

      const groupKey = startDate.getTime();
      const label = this.dayLabelForDate(startDate, today);

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

      const existing = dayGroups.get(groupKey);
      if (existing) {
        existing.tasks.push(taskVM);
      } else {
        dayGroups.set(groupKey, { label, tasks: [taskVM] });
      }
    }

    const realGroups = Array.from(dayGroups.entries())
      .sort(([a], [b]) => a - b)
      .map(([, group]) => ({
        label: group.label,
        tasks: group.tasks,
      }));
    return realGroups.length > 0 ? realGroups : this.previewMockGroups;
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
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  private todayStart(): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private offsetDaysFromToday(days: number): Date {
    const date = this.todayStart();
    date.setDate(date.getDate() + days);
    return date;
  }
}
