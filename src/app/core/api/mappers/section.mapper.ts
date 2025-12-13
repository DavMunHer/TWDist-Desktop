import { TWDSection } from '../../../models/section';
import { TWDTask } from '../../../models/task';
import { SectionDto } from '../dto/section/section.dto';
import { taskFromDto } from './task.mapper';

// Leaf mapper
export function sectionFromDto(
  dto: SectionDto,
  projectId: string
): {
  section: TWDSection;
  tasks: TWDTask[];
} {
  const sectionId = String(dto.id);

  return {
    section: {
      id: sectionId,
      projectId,
      name: dto.name,
      tasksIds: dto.tasks.map((t) => String(t.id)),
    },
    tasks: dto.tasks.map((t) => taskFromDto(t, sectionId)),
  };
}
