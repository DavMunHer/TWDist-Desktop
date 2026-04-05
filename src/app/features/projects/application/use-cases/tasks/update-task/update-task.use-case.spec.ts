import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

import { Task } from '@features/projects/domain/entities/task.entity';
import { TaskRepository } from '@features/projects/domain/repositories/task.repository';

import { UpdateTaskUseCase } from './update-task.use-case';

describe('UpdateTaskUseCase', () => {
  let useCase: UpdateTaskUseCase;
  let repo: Partial<TaskRepository>;

  beforeEach(() => {
    repo = {
      update: vi.fn((projectId: string, task: Task) => of(task)),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        UpdateTaskUseCase,
        { provide: TaskRepository, useValue: repo },
      ],
    });

    useCase = TestBed.inject(UpdateTaskUseCase);
  });

  it('delegates to taskRepository.update', () => {
    const task = Task.create('Original', 'sec-1', new Date('2025-01-01'), 'task-1').updateName('Updated');

    useCase.execute('p1', task).subscribe((updated) => {
      expect(updated.name).toBe('Updated');
    });

    expect(repo.update).toHaveBeenCalledWith('p1', task);
  });
});
