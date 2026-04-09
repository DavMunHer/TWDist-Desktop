import { inject, Injectable } from "@angular/core";
import { ProjectRepository } from "@features/projects/domain/repositories/project.repository";
import { Observable, of } from "rxjs";
import { Project } from "@features/projects/domain/entities/project.entity";
import { ProjectName } from "@features/projects/domain/value-objects/project-name.value-object";
import { toProjectOutput } from '@features/projects/application/mappers/project-output.mapper';
import { catchError, map } from "rxjs/operators";
import { Result, fail, ok } from '@shared/utils/result';
import { ProjectsError } from '@features/projects/application/errors/projects.error';

export interface CreateProjectInput {
  name: string;
  favorite: boolean;
}

export interface CreateProjectOutput {
  id: string;
  name: string;
  favorite: boolean;
  sectionIds: string[];
}

@Injectable()
export class CreateProjectUseCase {
  private readonly projectRepository = inject(ProjectRepository);

  execute(input: CreateProjectInput): Observable<Result<CreateProjectOutput, ProjectsError>> {
    const projectNameResult = ProjectName.tryCreate(input.name);
    if (!projectNameResult.success) {
      return of(fail(projectNameResult.error));
    }

    const projectName = projectNameResult.value;
    const project = Project.create(projectName, input.favorite);

    return this.projectRepository.create(project).pipe(
      map((saved): Result<CreateProjectOutput, ProjectsError> => ok(toProjectOutput(saved, []))),
      catchError(() => of(fail<ProjectsError>({ code: 'NETWORK_ERROR' }))),
    );
  }
}
