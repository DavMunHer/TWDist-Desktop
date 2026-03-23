export interface ProjectOutput {
  id: string;
  name: string;
  favorite: boolean;
  /**
   * Presentation-layer index of sections that belong to this project.
   * Used for performance (avoid scanning every SectionStore entry).
   */
  sectionIds: string[];
}

