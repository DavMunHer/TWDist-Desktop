import { Section } from '../../domain/entities/section.entity';

/**
 * Normalized state for all sections, keyed by ID.
 *
 * Each section holds `taskIds` pointing into the TaskStore's dictionary.
 */
export interface SectionState {
  sections: Record<string, Section>;
  loading: boolean;
  error: string | null;
}

export const initialSectionState: SectionState = {
  sections: {},
  loading: false,
  error: null,
};
