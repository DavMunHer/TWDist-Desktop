import { TWDProject } from '../../../models/project.model';
import { TWDSection } from '../../../models/section.model';
import { TWDTask } from '../../../models/task.model';
import { ProjectDto } from '../dto/project/project.dto';
import { sectionFromDto } from './section.mapper';

// Aggregate mapper
export function projectFromDto(dto: ProjectDto): {
  project: TWDProject;
  sections: TWDSection[];
  tasks: TWDTask[];
} {
  const projectId = String(dto.id);

  const sections: TWDSection[] = [];
  const tasks: TWDTask[] = [];

  for (const sectionDto of dto.sections) {
    const result = sectionFromDto(sectionDto, projectId);
    sections.push(result.section);
    tasks.push(...result.tasks);
	}
	
  return {
    project: {
      id: projectId,
      name: dto.name,
      sectionIds: sections.map((s) => s.id),
    },
    sections,
    tasks,
  };
}
