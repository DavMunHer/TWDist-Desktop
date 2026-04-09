import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Section } from '@features/projects/domain/entities/section.entity';
import { SectionRepository } from '@features/projects/domain/repositories/section.repository';
import { Result, fail, ok } from '@shared/utils/result';
import { ProjectsError } from '@features/projects/application/errors/projects.error';
import { SectionName } from '@features/projects/domain/value-objects/section-name.value-object';

@Injectable()
export class CreateSectionUseCase {
  private readonly sectionRepository = inject(SectionRepository);


  execute(projectId: string, sectionName: string): Observable<Result<Section, ProjectsError>> {
    const sectionNameResult = SectionName.tryCreate(sectionName);
    if (!sectionNameResult.success) {
      return of(fail(sectionNameResult.error));
    }

    const section = new Section(crypto.randomUUID(), sectionNameResult.value.value, projectId, []);
    return this.sectionRepository.create(section).pipe(
      map((createdSection): Result<Section, ProjectsError> => ok(createdSection)),
      catchError(() => of(fail<ProjectsError>({ code: 'NETWORK_ERROR' }))),
    );
  }
}
