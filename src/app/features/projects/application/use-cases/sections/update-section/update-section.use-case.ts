import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SectionRepository } from '@features/projects/domain/repositories/section.repository';
import { Section } from '@features/projects/domain/entities/section.entity';
import { SectionName } from '@features/projects/domain/value-objects/section-name.value-object';
import { SectionOutput } from '@features/projects/application/dtos/section-output';
import { toSectionOutput } from '@features/projects/application/mappers/section-output.mapper';

export interface UpdateSectionInput {
  id: string;
  name: string;
  projectId: string;
}

@Injectable()
export class UpdateSectionUseCase {
  private sectionRepository = inject(SectionRepository);

  execute(input: UpdateSectionInput): Observable<SectionOutput> {
    const sectionName = SectionName.create(input.name);
    const section = new Section(input.id, sectionName.value, input.projectId, []);
    return this.sectionRepository.update(section).pipe(
      map(toSectionOutput),
    );
  }
}
