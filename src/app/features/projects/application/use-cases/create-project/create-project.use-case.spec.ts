import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

import { CreateProjectUseCase } from './create-project.use-case';
import { ProjectRepository } from '@features/projects/domain/repositories/project.repository';
import { Project } from '@features/projects/domain/entities/project.entity';
import { ProjectName } from '@features/projects/domain/value-objects/project-name.value-object';

const input = { name: 'NN', favorite: true };
const created = new Project('new-id', ProjectName.create('NN'), true, []);

describe('CreateProjectUseCase', () => {
  let useCase: CreateProjectUseCase;
  let repo: Partial<ProjectRepository>;

  beforeEach(() => {
    repo = {
      create: vi.fn().mockReturnValue(of(created)),
    };
    useCase = new CreateProjectUseCase(repo as ProjectRepository);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: CreateProjectUseCase, useValue: useCase },
        { provide: ProjectRepository, useValue: repo },
      ],
    });
  });

  it('validates name, builds Project and delegates to projectRepository.create', () => {
    const expectedOutput = { id: 'new-id', name: 'NN', favorite: true, sectionIds: [] };

    useCase.execute(input).subscribe((out) => expect(out).toEqual(expectedOutput));
    expect(repo.create).toHaveBeenCalled();
    const arg = (repo.create as ReturnType<typeof vi.fn>).mock.calls[0][0] as Project;
    expect(arg).toBeInstanceOf(Project);
    expect(arg.name.value).toBe('NN');
    expect(arg.favorite).toBe(true);
  });

  it('throws when name violates ProjectName rules', () => {
    expect(() => useCase.execute({ name: '', favorite: false })).toThrow('Project name is required');
    expect(repo.create).not.toHaveBeenCalled();
  });
});
