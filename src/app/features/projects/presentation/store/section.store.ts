import { computed, inject, Injectable, signal } from '@angular/core';
import { CreateSectionUseCase } from '@features/projects/application/use-cases/sections/create-section/create-section.use-case';
import { UpdateSectionInput, UpdateSectionUseCase } from '@features/projects/application/use-cases/sections/update-section/update-section.use-case';
import { DeleteSectionUseCase } from '@features/projects/application/use-cases/sections/delete-section/delete-section.use-case';
import { initialSectionState, SectionState } from '@features/projects/presentation/models/section-state';
import { Section } from '@features/projects/domain/entities/section.entity';
import { TaskStore } from '@features/projects/presentation/store/task.store';
import { toProjectsUiError } from '@features/projects/presentation/mappers/projects-ui-error.mapper';
import { UiError } from '@features/projects/presentation/models/ui-error';

/**
 * Normalized store for **sections**.
 *
 * Each section lives as a flat entry keyed by ID.
 * `Section.taskIds` points into the TaskStore's dictionary.
 */
@Injectable({ providedIn: 'root' })
export class SectionStore {
  private readonly createSectionUseCase = inject(CreateSectionUseCase);
  private readonly updateSectionUseCase = inject(UpdateSectionUseCase);
  private readonly deleteSectionUseCase = inject(DeleteSectionUseCase);
  private readonly taskStore = inject(TaskStore);

  private readonly state = signal<SectionState>(initialSectionState);

  // ===================================================================
  // SELECTORS
  // ===================================================================

  /** Full sections dictionary (for cross-store reads) */
  readonly sections = computed(() => this.state().sections);

  /** Loading flag */
  readonly loading = computed(() => this.state().loading);

  /** Last error */
  readonly error = computed(() => this.state().error);

  /** Last rich error details */
  readonly errorDetails = computed(() => this.state().errorDetails);

  private setError(message: string, details: UiError | null, context: string, raw: unknown): void {
    this.state.update(s => ({ ...s, error: message, errorDetails: details }));
    console.error(`Failed to ${context}:`, raw);
  }

  /** Get a single section by ID */
  getSection(sectionId: string): Section | undefined {
    return this.state().sections[sectionId];
  }

  // ===================================================================
  // ACTIONS — bulk merge (used by ProjectStore during load)
  // ===================================================================

  /** Merge an array of sections into the dictionary */
  mergeSections(sections: Section[]): void {
    this.state.update(s => {
      const merged = { ...s.sections };
      for (const section of sections) {
        merged[section.id] = section;
      }
      return { ...s, sections: merged };
    });
  }

  // ===================================================================
  // ACTIONS — single section mutations
  // ===================================================================

  /**
   * Create a section for a project.
   * The callback `onCreated` lets the ProjectStore link the section to its project.
   */
  createSection(
    projectId: string,
    sectionName: string,
    onCreated?: (section: Section) => void,
  ): void {
    this.createSectionUseCase.execute(projectId, sectionName).subscribe({
      next: (result) => {
        if (!result.success) {
          const uiError = toProjectsUiError(result.error);
          this.setError(uiError.message, uiError, 'create section', result.error);
          return;
        }

        const section = result.value;
        this.state.update(s => ({
          ...s,
          sections: { ...s.sections, [section.id]: section },
        }));
        onCreated?.(section);
      },
    });
  }

  /**
   * Called by TaskStore (via ProjectStore) after a task is created,
   * to add the task ID to the section's `taskIds`.
   */
  addTaskToSection(sectionId: string, taskId: string): void {
    this.state.update(s => {
      const section = s.sections[sectionId];
      if (!section) return s;

      return {
        ...s,
        sections: {
          ...s.sections,
          [sectionId]: section.addTask(taskId),
        },
      };
    });
  }

  /**
   * Update a section's name with **optimistic UI**.
   * The store is updated immediately; on failure the original name is restored.
   */
  updateSection(sectionId: string, newName: string): void {
    const existing = this.state().sections[sectionId];
    if (!existing) return;

    const optimistic = existing.updateName(newName);
    this.state.update(s => ({
      ...s,
      sections: { ...s.sections, [sectionId]: optimistic },
    }));

    const input: UpdateSectionInput = {
      id: existing.id,
      name: newName,
      projectId: existing.projectId,
    };

    this.updateSectionUseCase.execute(input).subscribe({
      next: (result) => {
        if (!result.success) {
          const uiError = toProjectsUiError(result.error);
          this.state.update(s => ({
            ...s,
            sections: { ...s.sections, [sectionId]: existing },
            error: uiError.message,
            errorDetails: uiError,
          }));
          console.error('Failed to update section:', result.error);
          return;
        }

        const updated = result.value;
        this.state.update(s => ({
          ...s,
          sections: {
            ...s.sections,
            [sectionId]: new Section(updated.id, updated.name, updated.projectId, existing.taskIds),
          },
        }));
      },
    });
  }

  /**
   * Delete a section with **optimistic UI**.
   * The section is removed immediately; on failure it is restored.
   * The optional `onDeleted` callback is invoked before the HTTP call so
   * `ProjectStore` can remove the sectionId from `ProjectOutput.sectionIds`.
   */
  deleteSection(
    projectId: string,
    sectionId: string,
    onDeleted?: () => void,
  ): void {
    const existing = this.state().sections[sectionId];
    if (!existing) return;

    this.state.update(s => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [sectionId]: _, ...rest } = s.sections;
      return { ...s, sections: rest };
    });
    onDeleted?.();

    this.deleteSectionUseCase.execute(projectId, sectionId).subscribe({
      error: (error) => {
        this.state.update(s => ({
          ...s,
          sections: { ...s.sections, [sectionId]: existing },
        }));
        this.setError(error.message, null, 'delete section', error);
      },
    });
  }

  /** Remove a section entirely from the store */
  removeSection(sectionId: string): void {
    this.state.update(s => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [sectionId]: _, ...rest } = s.sections;
      return { ...s, sections: rest };
    });
  }

  /** Remove a task ID from a section's `taskIds` */
  removeTaskFromSection(sectionId: string, taskId: string): void {
    this.state.update(s => {
      const section = s.sections[sectionId];
      if (!section) return s;

      return {
        ...s,
        sections: {
          ...s.sections,
          [sectionId]: section.removeTask(taskId),
        },
      };
    });
  }
}
