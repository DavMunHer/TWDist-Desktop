import { Injectable, inject } from "@angular/core";
import { ProjectRepository } from "@features/projects/domain/repositories/project.repository";
import { ProjectDto } from "@features/projects/infrastructure/dto/project.dto";
import { Observable } from "rxjs";
import { Project } from "@features/projects/domain/entities/project.entity";

@Injectable()
export class CreateProjectUseCase {
  private projectRepository = inject(ProjectRepository);


  execute(dto: ProjectDto): Observable<Project> {
    return this.projectRepository.create(dto);
  }
}
