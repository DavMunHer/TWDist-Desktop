import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

import { ToggleFavoriteUseCase } from './toggle-favorite.use-case';
import { ProjectRepository } from '@features/projects/domain/repositories/project.repository';

describe('ToggleFavoriteUseCase', () => {
  let useCase: ToggleFavoriteUseCase;
  let repo: Partial<ProjectRepository>;

  beforeEach(() => {
    repo = {
      toggleFavorite: vi.fn().mockReturnValue(of(void 0)),
    };
    useCase = new ToggleFavoriteUseCase(repo as ProjectRepository);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ToggleFavoriteUseCase, useValue: useCase },
        { provide: ProjectRepository, useValue: repo },
      ],
    });
  });

  it('delegates to projectRepository.toggleFavorite', () => {
    useCase.execute('p1', true).subscribe();
    expect(repo.toggleFavorite).toHaveBeenCalledWith('p1', true);
  });
});
