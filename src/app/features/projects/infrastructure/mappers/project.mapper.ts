import { Project } from '../../domain/entities/project.entity';
import { Section } from '../../domain/entities/section.entity';
import { Task } from '../../domain/entities/task.entity';
import { ProjectAggregate } from '../../domain/repositories/project.repository';
import { ProjectDto } from '../dto/project.dto';
import { ProjectResponeDto } from '../dto/response/project.dto';
import { SectionMapper } from './section.mapper';
import { TaskMapper } from './task.mapper';

export class ProjectMapper {
  static toDomain(dto: ProjectResponeDto): Project {
    const sectionIds = (dto.sections ?? []).map(s => String(s.id));
    return new Project(
      String(dto.id),
      dto.name,
      dto.favorite,
      sectionIds
    );
  }

  /**
   * Maps a full API response (project + nested sections + tasks) into
   * a normalized ProjectAggregate for the store.
   */
  static toAggregate(dto: ProjectResponeDto): ProjectAggregate {
    const projectId = String(dto.id);
    const sections: Section[] = [];
    const tasks: Task[] = [];

    for (const sectionDto of dto.sections ?? []) {
      sections.push(SectionMapper.toDomain(sectionDto, projectId));
      for (const taskDto of sectionDto.tasks ?? []) {
        tasks.push(...TaskMapper.flattenToDomain(taskDto, String(sectionDto.id)));
      }
    }

    return {
      project: ProjectMapper.toDomain(dto),
      sections,
      tasks,
    };
  }

  static toDto(project: Project): Partial<ProjectDto> {
    return {
      name: project.name,
      favorite: project.favorite
    };
  }
}
