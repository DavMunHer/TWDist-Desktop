import { Section } from '@features/projects/domain/entities/section.entity';
import { UiError } from '@features/projects/presentation/models/ui-error';

/**
 * Normalized state for all sections, keyed by ID.
 *
 * Each section holds `taskIds` pointing into the TaskStore's dictionary.
 */
export interface SectionState {
  sections: Record<string, Section>;
  loading: boolean;
  error: string | null;
  errorDetails: UiError | null;
}

export const initialSectionState: SectionState = {
  sections: {},
  loading: false,
  error: null,
  errorDetails: null,
};
