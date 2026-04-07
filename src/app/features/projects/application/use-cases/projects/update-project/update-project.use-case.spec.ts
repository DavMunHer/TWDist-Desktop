import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { UpdateProjectUseCase } from './update-project.use-case';
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

describe('UpdateProjectUseCase', () => {
  let useCase: UpdateProjectUseCase;
  let repo: Partial<ProjectRepository>;

  beforeEach(() => {
    repo = {
      update: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        UpdateProjectUseCase,
        { provide: ProjectRepository, useValue: repo },
      ],
    });

    useCase = TestBed.inject(UpdateProjectUseCase);
  });

  it('validates name, builds Project and delegates to projectRepository.update', () => {
    const saved = new Project('p1', validProjectName('New Name'), true, ['s1']);
    (repo.update as ReturnType<typeof vi.fn>).mockReturnValue(of(saved));

    const input = { id: 'p1', name: 'New Name', favorite: true, sectionIds: ['s1'] };
    const expectedOutput = {
      success: true,
      value: { id: 'p1', name: 'New Name', favorite: true, sectionIds: ['s1'] },
    };

    useCase.execute(input).subscribe((out) => expect(out).toEqual(expectedOutput));

    expect(repo.update).toHaveBeenCalled();
    const arg = (repo.update as ReturnType<typeof vi.fn>).mock.calls[0][0] as Project;
    expect(arg).toBeInstanceOf(Project);
    expect(arg.id).toBe('p1');
    expect(arg.name.value).toBe('New Name');
    expect(arg.favorite).toBe(true);
  });

  it('returns validation error result when name violates ProjectName rules', () => {
    useCase.execute({ id: 'p1', name: '', favorite: false, sectionIds: [] }).subscribe((result) => {
      expect(result).toEqual({ success: false, error: { code: 'PROJECT_NAME_REQUIRED' } });
    });

    expect(repo.update).not.toHaveBeenCalled();
  });

  it('maps repository failures to NETWORK_ERROR', () => {
    (repo.update as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('boom')));

    useCase.execute({ id: 'p1', name: 'New Name', favorite: true, sectionIds: [] }).subscribe((result) => {
      expect(result).toEqual({ success: false, error: { code: 'NETWORK_ERROR' } });
    });
  });
});

