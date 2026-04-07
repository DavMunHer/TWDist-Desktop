import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of, throwError } from 'rxjs';

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
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CreateSectionUseCase,
        { provide: SectionRepository, useValue: sectionRepo },
        { provide: ProjectRepository, useValue: projectRepo },
      ],
    });
    useCase = TestBed.inject(CreateSectionUseCase);
  });

  it('builds Section via Section.create and calls sectionRepository.create', () => {
    let result: { success: true; value: Section } | { success: false; error: unknown } | undefined;
    useCase.execute('p1', 'Sprint 1').subscribe((s) => (result = s));
    expect(sectionRepo.create).toHaveBeenCalled();
    const arg = (sectionRepo.create as ReturnType<typeof vi.fn>).mock.calls[0][0] as Section;
    expect(arg.name).toBe('Sprint 1');
    expect(arg.projectId).toBe('p1');
    expect(result?.success).toBe(true);
    if (result?.success) {
      expect(result.value.id).toBe('s-new');
    }
  });

  it('returns validation result when section name is invalid', () => {
    useCase.execute('p1', '').subscribe((result) => {
      expect(result).toEqual({ success: false, error: { code: 'SECTION_NAME_REQUIRED' } });
    });

    expect(sectionRepo.create).not.toHaveBeenCalled();
  });

  it('maps repository failures to NETWORK_ERROR', () => {
    (sectionRepo.create as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('boom')));

    useCase.execute('p1', 'Sprint 1').subscribe((result) => {
      expect(result).toEqual({ success: false, error: { code: 'NETWORK_ERROR' } });
    });
  });
});
