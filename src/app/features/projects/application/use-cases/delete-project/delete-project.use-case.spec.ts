import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

import { DeleteProjectUseCase } from './delete-project.use-case';
import { ProjectRepository } from '@features/projects/domain/repositories/project.repository';

describe('DeleteProjectUseCase', () => {
  let useCase: DeleteProjectUseCase;
  let repo: Partial<ProjectRepository>;

  beforeEach(() => {
    repo = {
      delete: vi.fn().mockReturnValue(of(void 0)),
    };
    useCase = new DeleteProjectUseCase(repo as ProjectRepository);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: DeleteProjectUseCase, useValue: useCase },
        { provide: ProjectRepository, useValue: repo },
      ],
    });
  });

  it('delegates to projectRepository.delete', () => {
    useCase.execute('pid').subscribe();
    expect(repo.delete).toHaveBeenCalledWith('pid');
  });
});
