import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRepository, ProjectAggregate } from '@features/projects/domain/repositories/project.repository';

@Injectable()
export class LoadProjectUseCase {
  private projectRepository = inject(ProjectRepository);


  execute(projectId: string): Observable<ProjectAggregate> {
    return this.projectRepository.findById(projectId);
  }
}
