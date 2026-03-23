import { describe, it, expect } from 'vitest';

import { ToggleTaskCompletionUseCase } from './toggle-task-completion.use-case';
import { Task } from '@features/projects/domain/entities/task.entity';

describe('ToggleTaskCompletionUseCase', () => {
  const useCase = new ToggleTaskCompletionUseCase();
  const start = new Date('2025-01-01');
  const open = Task.create('T', 's', start, 't1');
  const done = open.complete();

  it('returns completed task when input was incomplete', () => {
    useCase.execute(open).subscribe((t) => {
      expect(t.completed).toBe(true);
    });
  });

  it('returns uncompleted task when input was complete', () => {
    useCase.execute(done).subscribe((t) => {
      expect(t.completed).toBe(false);
    });
  });
});
