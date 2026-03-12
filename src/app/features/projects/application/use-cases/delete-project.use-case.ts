import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRepository } from '../../domain/repositories/project.repository';

@Injectable()
export class DeleteProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  execute(projectId: string): Observable<void> {
    return this.projectRepository.delete(projectId);
  }
}
