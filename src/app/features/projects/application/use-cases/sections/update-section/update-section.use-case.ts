import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SectionRepository } from '@features/projects/domain/repositories/section.repository';
import { Section } from '@features/projects/domain/entities/section.entity';
import { SectionName } from '@features/projects/domain/value-objects/section-name.value-object';
import { SectionOutput } from '@features/projects/application/dtos/section-output';
import { toSectionOutput } from '@features/projects/application/mappers/section-output.mapper';
import { Result, fail, ok } from '@shared/utils/result';
import { ProjectsError } from '@features/projects/application/errors/projects.error';

export interface UpdateSectionInput {
  id: string;
  name: string;
  projectId: string;
}

@Injectable()
export class UpdateSectionUseCase {
  private readonly sectionRepository = inject(SectionRepository);

  execute(input: UpdateSectionInput): Observable<Result<SectionOutput, ProjectsError>> {
    const sectionNameResult = SectionName.tryCreate(input.name);
    if (!sectionNameResult.success) {
      return of(fail(sectionNameResult.error));
    }

    const section = new Section(input.id, sectionNameResult.value.value, input.projectId, []);
    return this.sectionRepository.update(section).pipe(
      map((saved): Result<SectionOutput, ProjectsError> => ok(toSectionOutput(saved))),
      catchError(() => of(fail<ProjectsError>({ code: 'NETWORK_ERROR' }))),
    );
  }
}
