import { Section } from '@features/projects/domain/entities/section.entity';
import { SectionOutput } from '@features/projects/application/dtos/section-output';

export function toSectionOutput(section: Section): SectionOutput {
  return {
    id: section.id,
    name: section.name,
    projectId: section.projectId,
    taskIds: [...section.taskIds],
  };
}
