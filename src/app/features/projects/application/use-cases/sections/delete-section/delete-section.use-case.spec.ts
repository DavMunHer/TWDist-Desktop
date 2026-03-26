import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

import { DeleteSectionUseCase } from './delete-section.use-case';
import { SectionRepository } from '@features/projects/domain/repositories/section.repository';

describe('DeleteSectionUseCase', () => {
  let useCase: DeleteSectionUseCase;
  let repo: Partial<SectionRepository>;

  beforeEach(() => {
    repo = {
      delete: vi.fn().mockReturnValue(of(void 0)),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        DeleteSectionUseCase,
        { provide: SectionRepository, useValue: repo },
      ],
    });

    useCase = TestBed.inject(DeleteSectionUseCase);
  });

  it('delegates to sectionRepository.delete with the correct ids', () => {
    useCase.execute('p1', 's1').subscribe();
    expect(repo.delete).toHaveBeenCalledWith('p1', 's1');
  });
});
