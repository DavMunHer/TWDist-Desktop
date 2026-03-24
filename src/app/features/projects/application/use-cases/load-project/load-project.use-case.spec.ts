import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

import { LoadProjectUseCase } from './load-project.use-case';
import { ProjectRepository, ProjectAggregate } from '@features/projects/domain/repositories/project.repository';
import { Project } from '@features/projects/domain/entities/project.entity';
import { ProjectName } from '@features/projects/domain/value-objects/project-name.value-object';

const aggregate: ProjectAggregate = {
  project: new Project('p1', ProjectName.create('PP'), false, []),
  sections: [],
  tasks: [],
};

describe('LoadProjectUseCase', () => {
  let useCase: LoadProjectUseCase;
  let repo: Partial<ProjectRepository>;

  beforeEach(() => {
    repo = {
      findById: vi.fn().mockReturnValue(of(aggregate)),
    };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        LoadProjectUseCase,
        { provide: ProjectRepository, useValue: repo },
      ],
    });
    useCase = TestBed.inject(LoadProjectUseCase);
  });

  it('delegates to projectRepository.findById', () => {
    const expected = {
      project: { id: 'p1', name: 'PP', favorite: false, sectionIds: [] },
      sections: [],
      tasks: [],
    };

    useCase.execute('p1').subscribe((r) => expect(r).toEqual(expected));
    expect(repo.findById).toHaveBeenCalledWith('p1');
  });
});
