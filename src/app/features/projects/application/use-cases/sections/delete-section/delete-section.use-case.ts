import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SectionRepository } from '@features/projects/domain/repositories/section.repository';

@Injectable()
export class DeleteSectionUseCase {
  private sectionRepository = inject(SectionRepository);

  execute(projectId: string, sectionId: string): Observable<void> {
    return this.sectionRepository.delete(projectId, sectionId);
  }
}
