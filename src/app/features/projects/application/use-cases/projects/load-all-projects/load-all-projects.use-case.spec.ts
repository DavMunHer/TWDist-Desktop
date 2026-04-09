import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

import { LoadAllProjectsUseCase } from './load-all-projects.use-case';
import { ProjectRepository, ProjectSummary } from '@features/projects/domain/repositories/project.repository';
import { Project } from '@features/projects/domain/entities/project.entity';
import { ProjectName } from '@features/projects/domain/value-objects/project-name.value-object';

function validProjectName(value: string): ProjectName {
  const result = ProjectName.tryCreate(value);
  if (!result.success) {
    throw new Error('Invalid test project name');
  }

  return result.value;
}

const summaries: ProjectSummary[] = [
  { project: new Project('1', validProjectName('AA'), false, []), pendingCount: 2 },
];

describe('LoadAllProjectsUseCase', () => {
  let useCase: LoadAllProjectsUseCase;
  let repo: Partial<ProjectRepository>;

  beforeEach(() => {
    repo = {
      getAll: vi.fn().mockReturnValue(of(summaries)),
    };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        LoadAllProjectsUseCase,
        { provide: ProjectRepository, useValue: repo },
      ],
    });
    useCase = TestBed.inject(LoadAllProjectsUseCase);
  });

  it('delegates to projectRepository.getAll', () => {
    const expected = [
      {
        project: { id: '1', name: 'AA', favorite: false, sectionIds: [] },
        pendingCount: 2,
      },
    ];

    useCase.execute().subscribe((r) => expect(r).toEqual(expected));
    expect(repo.getAll).toHaveBeenCalled();
  });
});
