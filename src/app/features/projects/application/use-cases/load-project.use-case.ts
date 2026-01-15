import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRepository, ProjectAggregate } from '../../domain/repositories/project.repository';
import { Project } from '../../domain/entities/project.entity';

@Injectable()
export class LoadProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  execute(projectId: string): Observable<Project> {
    return this.projectRepository.findById(projectId);
  }
}
