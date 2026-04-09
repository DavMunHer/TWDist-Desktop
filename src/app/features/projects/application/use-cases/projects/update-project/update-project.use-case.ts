import { inject, Injectable } from "@angular/core";
import { ProjectRepository } from "@features/projects/domain/repositories/project.repository";
import { Observable, of } from "rxjs";
import { Project } from "@features/projects/domain/entities/project.entity";
import { ProjectName } from "@features/projects/domain/value-objects/project-name.value-object";
import { toProjectOutput } from '@features/projects/application/mappers/project-output.mapper';
import { catchError, map } from "rxjs/operators";
import { ProjectOutput } from "@features/projects/application/dtos/project-output";
import { Result, fail, ok } from '@shared/utils/result';
import { ProjectsError } from '@features/projects/application/errors/projects.error';

export interface UpdateProjectInput {
  id: string;
  name: string;
  favorite: boolean;
  sectionIds: readonly string[];
}

@Injectable()
export class UpdateProjectUseCase {
  private readonly projectRepository = inject(ProjectRepository);

  execute(input: UpdateProjectInput): Observable<Result<ProjectOutput, ProjectsError>> {
    const projectNameResult = ProjectName.tryCreate(input.name);
    if (!projectNameResult.success) {
      return of(fail(projectNameResult.error));
    }

    const projectName = projectNameResult.value;
    const project = new Project(input.id, projectName, input.favorite, input.sectionIds);

    return this.projectRepository.update(project).pipe(
      map((saved): Result<ProjectOutput, ProjectsError> => ok({
          ...toProjectOutput(saved, []),
          sectionIds: [...input.sectionIds],
        })),
      catchError(() => of(fail<ProjectsError>({ code: 'NETWORK_ERROR' }))),
    );
  }
}
