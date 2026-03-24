import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Section } from '@features/projects/domain/entities/section.entity';
import { SectionRepository } from '@features/projects/domain/repositories/section.repository';
import { ProjectRepository } from '@features/projects/domain/repositories/project.repository';

@Injectable()
export class CreateSectionUseCase {
  private sectionRepository = inject(SectionRepository);
  private projectRepository = inject(ProjectRepository);


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
