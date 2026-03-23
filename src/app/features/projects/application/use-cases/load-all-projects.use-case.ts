import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRepository, ProjectSummary } from '@features/projects/domain/repositories/project.repository';

@Injectable()
export class LoadAllProjectsUseCase {
  private projectRepository = inject(ProjectRepository);


  execute(): Observable<ProjectSummary[]> {
    return this.projectRepository.getAll();
  }
}
