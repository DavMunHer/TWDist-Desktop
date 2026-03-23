import { Project } from '@features/projects/domain/entities/project.entity';
import { Section } from '@features/projects/domain/entities/section.entity';
import { ProjectOutput } from '@features/projects/application/dtos/project-output';

/**
 * Maps domain `Project` + related domain `Section`s into application output
 * (primitives only). The `sectionIds` index belongs to the presentation shape.
 */
export function toProjectOutput(project: Project, sections: Section[]): ProjectOutput {
  return {
    id: project.id,
    name: project.name.value,
    favorite: project.favorite,
    sectionIds: sections
      .filter((s) => s.projectId === project.id)
      .map((s) => s.id),
  };
}

