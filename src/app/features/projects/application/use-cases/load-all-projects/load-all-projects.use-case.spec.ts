import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

import { LoadAllProjectsUseCase } from './load-all-projects.use-case';
import { ProjectRepository, ProjectSummary } from '@features/projects/domain/repositories/project.repository';
import { Project } from '@features/projects/domain/entities/project.entity';
import { ProjectName } from '@features/projects/domain/value-objects/project-name.value-object';

const summaries: ProjectSummary[] = [
  { project: new Project('1', ProjectName.create('AA'), false, []), pendingCount: 2 },
];

describe('LoadAllProjectsUseCase', () => {
  let useCase: LoadAllProjectsUseCase;
  let repo: Partial<ProjectRepository>;

  beforeEach(() => {
    repo = {
      getAll: vi.fn().mockReturnValue(of(summaries)),
    };
    useCase = new LoadAllProjectsUseCase(repo as ProjectRepository);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: LoadAllProjectsUseCase, useValue: useCase },
        { provide: ProjectRepository, useValue: repo },
      ],
    });
  });

  it('delegates to projectRepository.getAll', () => {
    useCase.execute().subscribe((r) => expect(r).toEqual(summaries));
    expect(repo.getAll).toHaveBeenCalled();
  });
});
