import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { CreateProjectUseCase } from './create-project.use-case';
import { ProjectRepository } from '@features/projects/domain/repositories/project.repository';
import { Project } from '@features/projects/domain/entities/project.entity';
import { ProjectName } from '@features/projects/domain/value-objects/project-name.value-object';

function validProjectName(value: string): ProjectName {
  const result = ProjectName.tryCreate(value);
  if (!result.success) {
    throw new Error('Invalid test project name');
  }

  return result.value;
}

const input = { name: 'NN', favorite: true };
const created = new Project('new-id', validProjectName('NN'), true, []);

describe('CreateProjectUseCase', () => {
  let useCase: CreateProjectUseCase;
  let repo: Partial<ProjectRepository>;

  beforeEach(() => {
    repo = {
      create: vi.fn().mockReturnValue(of(created)),
    };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CreateProjectUseCase,
        { provide: ProjectRepository, useValue: repo },
      ],
    });
    useCase = TestBed.inject(CreateProjectUseCase);
  });

  it('validates name, builds Project and delegates to projectRepository.create', () => {
    const expectedOutput = {
      success: true,
      value: { id: 'new-id', name: 'NN', favorite: true, sectionIds: [] },
    };

    useCase.execute(input).subscribe((out) => expect(out).toEqual(expectedOutput));
    expect(repo.create).toHaveBeenCalled();
    const arg = (repo.create as ReturnType<typeof vi.fn>).mock.calls[0][0] as Project;
    expect(arg).toBeInstanceOf(Project);
    expect(arg.name.value).toBe('NN');
    expect(arg.favorite).toBe(true);
  });

  it('returns validation error result when name violates ProjectName rules', () => {
    useCase.execute({ name: '', favorite: false }).subscribe((result) => {
      expect(result).toEqual({ success: false, error: { code: 'PROJECT_NAME_REQUIRED' } });
    });

    expect(repo.create).not.toHaveBeenCalled();
  });

  it('maps repository failures to NETWORK_ERROR', () => {
    (repo.create as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('boom')));

    useCase.execute(input).subscribe((result) => {
      expect(result).toEqual({ success: false, error: { code: 'NETWORK_ERROR' } });
    });
  });
});
