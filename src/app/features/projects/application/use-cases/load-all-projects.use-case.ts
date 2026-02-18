import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { Project } from '../../domain/entities/project.entity';

@Injectable()
export class LoadAllProjectsUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  execute(): Observable<Project[]> {
    return this.projectRepository.getAll();
  }
}
