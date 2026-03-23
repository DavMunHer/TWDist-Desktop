import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRepository, ProjectAggregate } from '@features/projects/domain/repositories/project.repository';
import { ProjectOutput } from '@features/projects/application/dtos/project-output';
import { Section } from '@features/projects/domain/entities/section.entity';
import { Task } from '@features/projects/domain/entities/task.entity';
import { toProjectOutput } from '@features/projects/application/mappers/project-output.mapper';
import { map } from 'rxjs/operators';

export interface LoadProjectOutput {
  project: ProjectOutput;
  sections: Section[];
  tasks: Task[];
}

@Injectable()
export class LoadProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  execute(projectId: string): Observable<LoadProjectOutput> {
    return this.projectRepository.findById(projectId).pipe(
      map((agg: ProjectAggregate) => ({
        project: toProjectOutput(agg.project, agg.sections),
        sections: agg.sections,
        tasks: agg.tasks,
      })),
    );
  }
}
