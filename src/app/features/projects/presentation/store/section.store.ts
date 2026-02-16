import { computed, inject, Injectable, signal } from '@angular/core';
import { CreateSectionUseCase } from '../../application/use-cases/create-section.use-case';
import { initialSectionState, SectionState } from '../models/section-state';
import { Section } from '../../domain/entities/section.entity';
import { TaskStore } from './task.store';

/**
 * Normalized store for **sections**.
 *
 * Each section lives as a flat entry keyed by ID.
 * `Section.taskIds` points into the TaskStore's dictionary.
 */
@Injectable({ providedIn: 'root' })
export class SectionStore {
  private readonly createSectionUseCase = inject(CreateSectionUseCase);
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
      next: (section) => {
        this.state.update(s => ({
          ...s,
          sections: { ...s.sections, [section.id]: section },
        }));
        onCreated?.(section);
      },
      error: (error) => {
        this.state.update(s => ({ ...s, error: error.message }));
        console.error('Failed to create section:', error);
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
