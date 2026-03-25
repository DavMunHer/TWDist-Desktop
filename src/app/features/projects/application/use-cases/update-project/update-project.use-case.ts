import { inject, Injectable } from "@angular/core";
import { ProjectRepository } from "@features/projects/domain/repositories/project.repository";
import { Observable } from "rxjs";
import { Project } from "@features/projects/domain/entities/project.entity";
import { ProjectName } from "@features/projects/domain/value-objects/project-name.value-object";
import { toProjectOutput } from '@features/projects/application/mappers/project-output.mapper';
import { map } from "rxjs/operators";
import { ProjectOutput } from "@features/projects/application/dtos/project-output";

export interface UpdateProjectInput {
  id: string;
  name: string;
  favorite: boolean;
  sectionIds: readonly string[];
}

@Injectable()
export class UpdateProjectUseCase {
  private projectRepository = inject(ProjectRepository);

  execute(input: UpdateProjectInput): Observable<ProjectOutput> {
    const projectName = ProjectName.create(input.name);
    const project = new Project(input.id, projectName, input.favorite, input.sectionIds);

    return this.projectRepository.update(project).pipe(
      map((saved) => ({
        ...toProjectOutput(saved, []),
        sectionIds: [...input.sectionIds],
      })),
    );
  }
}
