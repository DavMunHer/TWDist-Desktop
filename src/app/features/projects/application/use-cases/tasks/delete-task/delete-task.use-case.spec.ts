import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

import { TaskRepository } from '@features/projects/domain/repositories/task.repository';

import { DeleteTaskUseCase } from './delete-task.use-case';

describe('DeleteTaskUseCase', () => {
  let useCase: DeleteTaskUseCase;
  let repo: Partial<TaskRepository>;

  beforeEach(() => {
    repo = {
      delete: vi.fn(() => of(void 0)),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        DeleteTaskUseCase,
        { provide: TaskRepository, useValue: repo },
      ],
    });

    useCase = TestBed.inject(DeleteTaskUseCase);
  });

  it('delegates to taskRepository.delete', () => {
    useCase.execute('p1', 'sec-1', 't1').subscribe((result) => {
      expect(result).toBeUndefined();
    });

    expect(repo.delete).toHaveBeenCalledWith('p1', 'sec-1', 't1');
  });
});
