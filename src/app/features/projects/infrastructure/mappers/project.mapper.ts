import { Project } from '../../domain/entities/project.entity';
import { ProjectDto } from '../dto/project.dto';
import { ProjectResponeDto } from '../dto/response/project.dto';

export class ProjectMapper {
  static toDomain(dto: ProjectResponeDto): Project {
    return new Project(
      String(dto.id),
      dto.name,
      dto.favorite
    );
  }

  static toDto(project: Project): Partial<ProjectDto> {
    return {
      name: project.name,
      favorite: project.favorite
    };
  }
}
