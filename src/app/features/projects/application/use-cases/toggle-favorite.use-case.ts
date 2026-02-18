import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRepository } from '../../domain/repositories/project.repository';

@Injectable()
export class ToggleFavoriteUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  execute(projectId: string, favorite: boolean): Observable<void> {
    return this.projectRepository.toggleFavorite(projectId, favorite);
  }
}
