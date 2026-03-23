import { Project } from '@features/projects/domain/entities/project.entity';
import { ProjectName } from '@features/projects/domain/value-objects/project-name.value-object';
import { Section } from '@features/projects/domain/entities/section.entity';
import { Task } from '@features/projects/domain/entities/task.entity';
import { ProjectAggregate, ProjectSummary } from '@features/projects/domain/repositories/project.repository';
import { ProjectDto } from '@features/projects/infrastructure/dto/project.dto';
import { ProjectResponeDto } from '@features/projects/infrastructure/dto/response/project.dto';
import { ProjectSummaryDto } from '@features/projects/infrastructure/dto/response/project-summary.dto';
import { SectionMapper } from '@features/projects/infrastructure/mappers/section.mapper';
import { TaskMapper } from '@features/projects/infrastructure/mappers/task.mapper';

export class ProjectMapper {
  static toDomain(dto: ProjectResponeDto): Project {
    const sectionIds = (dto.sections ?? []).map(s => String(s.id));
    return new Project(
      String(dto.id),
      ProjectName.create(dto.name),
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

  static toSummary(dto: ProjectSummaryDto): ProjectSummary {
    const project = new Project(
      String(dto.id),
      ProjectName.create(dto.name),
      dto.favorite,
      []
    );

    return {
      project,
      pendingCount: dto.pendingCount,
    };
  }

  static toDto(project: Project): Partial<ProjectDto> {
    return {
      name: project.name.value,
      favorite: project.favorite
    };
  }
}
