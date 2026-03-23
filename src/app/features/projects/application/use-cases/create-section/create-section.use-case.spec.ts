import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

import { CreateSectionUseCase } from './create-section.use-case';
import { SectionRepository } from '@features/projects/domain/repositories/section.repository';
import { ProjectRepository } from '@features/projects/domain/repositories/project.repository';
import { Section } from '@features/projects/domain/entities/section.entity';

describe('CreateSectionUseCase', () => {
  let useCase: CreateSectionUseCase;
  let sectionRepo: Partial<SectionRepository>;
  let projectRepo: Partial<ProjectRepository>;

  beforeEach(() => {
    const created = new Section('s-new', 'Sprint 1', 'p1', []);
    sectionRepo = {
      create: vi.fn().mockReturnValue(of(created)),
    };
    projectRepo = {};
    useCase = new CreateSectionUseCase(
      sectionRepo as SectionRepository,
      projectRepo as ProjectRepository,
    );
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: CreateSectionUseCase, useValue: useCase },
        { provide: SectionRepository, useValue: sectionRepo },
        { provide: ProjectRepository, useValue: projectRepo },
      ],
    });
  });

  it('builds Section via Section.create and calls sectionRepository.create', () => {
    let result: Section | undefined;
    useCase.execute('p1', 'Sprint 1').subscribe((s) => (result = s));
    expect(sectionRepo.create).toHaveBeenCalled();
    const arg = (sectionRepo.create as ReturnType<typeof vi.fn>).mock.calls[0][0] as Section;
    expect(arg.name).toBe('Sprint 1');
    expect(arg.projectId).toBe('p1');
    expect(result?.id).toBe('s-new');
  });
});
