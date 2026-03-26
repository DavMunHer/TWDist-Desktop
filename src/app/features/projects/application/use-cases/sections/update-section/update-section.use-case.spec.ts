import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

import { UpdateSectionUseCase } from './update-section.use-case';
import { SectionRepository } from '@features/projects/domain/repositories/section.repository';
import { Section } from '@features/projects/domain/entities/section.entity';

describe('UpdateSectionUseCase', () => {
  let useCase: UpdateSectionUseCase;
  let repo: Partial<SectionRepository>;

  beforeEach(() => {
    repo = {
      update: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        UpdateSectionUseCase,
        { provide: SectionRepository, useValue: repo },
      ],
    });

    useCase = TestBed.inject(UpdateSectionUseCase);
  });

  it('builds Section from input and delegates to sectionRepository.update', () => {
    const saved = new Section('s1', 'Renamed', 'p1', ['t1']);
    (repo.update as ReturnType<typeof vi.fn>).mockReturnValue(of(saved));

    const input = { id: 's1', name: 'Renamed', projectId: 'p1' };
    const expectedOutput = { id: 's1', name: 'Renamed', projectId: 'p1', taskIds: ['t1'] };

    useCase.execute(input).subscribe((out) => expect(out).toEqual(expectedOutput));

    expect(repo.update).toHaveBeenCalled();
    const arg = (repo.update as ReturnType<typeof vi.fn>).mock.calls[0][0] as Section;
    expect(arg).toBeInstanceOf(Section);
    expect(arg.id).toBe('s1');
    expect(arg.name).toBe('Renamed');
    expect(arg.projectId).toBe('p1');
  });
});
