import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRepository, ProjectSummary } from '@features/projects/domain/repositories/project.repository';
import { ProjectOutput } from '@features/projects/application/dtos/project-output';
import { toProjectOutput } from '@features/projects/application/mappers/project-output.mapper';
import { map } from 'rxjs/operators';

export interface ProjectSummaryOutput {
  project: ProjectOutput;
  pendingCount: number;
}

@Injectable()
export class LoadAllProjectsUseCase {
  private projectRepository = inject(ProjectRepository);

  execute(): Observable<ProjectSummaryOutput[]> {
    return this.projectRepository.getAll().pipe(
      map((summaries: ProjectSummary[]) =>
        summaries.map((s) => ({
          project: toProjectOutput(s.project, []),
          pendingCount: s.pendingCount,
        })),
      ),
    );
  }
}
