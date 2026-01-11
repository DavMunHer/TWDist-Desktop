import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Section, SectionRepository, ProjectRepository } from '../../domain';

@Injectable()
export class CreateSectionUseCase {
  constructor(
    private sectionRepository: SectionRepository,
    private projectRepository: ProjectRepository
  ) {}

  execute(projectId: string, sectionName: string): Observable<Section> {
    const section = Section.create(sectionName, projectId);
    return this.sectionRepository.create(section).pipe(
      map(createdSection => {
        // Note: Project update to add section ID would be handled separately
        return createdSection;
      })
    );
  }
}
