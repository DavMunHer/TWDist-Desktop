import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

import { CreateProjectUseCase } from './create-project.use-case';
import { ProjectRepository } from '@features/projects/domain/repositories/project.repository';
import { ProjectDto } from '@features/projects/infrastructure/dto/project.dto';
import { Project } from '@features/projects/domain/entities/project.entity';

const dto: ProjectDto = { name: 'N', favorite: true };
const created = new Project('new-id', 'N', true, []);

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

  it('delegates to projectRepository.create with dto', () => {
    useCase.execute(dto).subscribe((p) => expect(p).toEqual(created));
    expect(repo.create).toHaveBeenCalledWith(dto);
  });
});
