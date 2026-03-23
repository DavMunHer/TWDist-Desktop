import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRepository } from '@features/projects/domain/repositories/project.repository';

@Injectable()
export class DeleteProjectUseCase {
  private projectRepository = inject(ProjectRepository);


  execute(projectId: string): Observable<void> {
    return this.projectRepository.delete(projectId);
  }
}
