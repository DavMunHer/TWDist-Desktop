import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRepository } from '@features/projects/domain/repositories/project.repository';

@Injectable()
export class ToggleFavoriteUseCase {
  private projectRepository = inject(ProjectRepository);


  execute(projectId: string, favorite: boolean): Observable<void> {
    return this.projectRepository.toggleFavorite(projectId, favorite);
  }
}
