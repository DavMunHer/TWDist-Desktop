import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Section } from '@features/projects/domain/entities/section.entity';
import { SectionRepository } from '@features/projects/domain/repositories/section.repository';

@Injectable()
export class UpdateSectionUseCase {
  private sectionRepository = inject(SectionRepository);

  execute(section: Section): Observable<Section> {
    return this.sectionRepository.update(section);
  }
}
