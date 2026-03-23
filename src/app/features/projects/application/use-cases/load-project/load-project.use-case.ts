import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRepository, ProjectAggregate } from '@features/projects/domain/repositories/project.repository';
import { ProjectOutput } from '@features/projects/application/dtos/project-output';
import { Section } from '@features/projects/domain/entities/section.entity';
import { Task } from '@features/projects/domain/entities/task.entity';
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
        project: {
          id: agg.project.id,
          name: agg.project.name.value,
          favorite: agg.project.favorite,
        },
        sections: agg.sections,
        tasks: agg.tasks,
      })),
    );
  }
}
