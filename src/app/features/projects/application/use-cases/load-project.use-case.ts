import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRepository, ProjectAggregate } from '../../domain';

@Injectable()
export class LoadProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  execute(projectId: string): Observable<ProjectAggregate> {
    return this.projectRepository.findById(projectId);
  }
}
