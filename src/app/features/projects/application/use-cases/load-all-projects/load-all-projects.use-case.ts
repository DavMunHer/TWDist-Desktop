import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRepository, ProjectSummary } from '@features/projects/domain/repositories/project.repository';

@Injectable()
export class LoadAllProjectsUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  execute(): Observable<ProjectSummary[]> {
    return this.projectRepository.getAll();
  }
}
