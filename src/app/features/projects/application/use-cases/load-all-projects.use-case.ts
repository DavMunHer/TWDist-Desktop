import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRepository, ProjectAggregate } from '../../domain/repositories/project.repository';

@Injectable()
export class LoadAllProjectsUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  execute(): Observable<ProjectAggregate[]> {
    return this.projectRepository.getAll();
  }
}
