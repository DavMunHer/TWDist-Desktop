import { Injectable } from "@angular/core";
import { ProjectRepository } from "@features/projects/domain/repositories/project.repository";
import { ProjectDto } from "@features/projects/infrastructure/dto/project.dto";
import { Observable } from "rxjs";
import { Project } from "@features/projects/domain/entities/project.entity";
import { ProjectName } from "@features/projects/domain/value-objects/project-name.value-object";

@Injectable()
export class CreateProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  execute(dto: ProjectDto): Observable<Project> {
    const name = ProjectName.create(dto.name);
    const project = Project.create(name, dto.favorite);
    return this.projectRepository.create(project);
  }
}
