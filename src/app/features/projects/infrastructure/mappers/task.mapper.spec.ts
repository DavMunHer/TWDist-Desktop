import { describe, it, expect } from 'vitest';

import { TaskMapper } from './task.mapper';
import { formatDateToISO } from '@shared/utils/date.util';
import { TaskDto } from '@features/projects/infrastructure/dto/task.dto';

describe('TaskMapper', () => {
  const start = new Date('2025-03-01');
  const end = new Date('2025-03-31');

  const dto: TaskDto = {
    id: 1,
    name: 'Main',
    description: 'd',
    start_date: start,
    end_date: end,
    completed: false,
    subtasks: [
      {
        id: 2,
        name: 'Sub',
        description: '',
        start_date: start,
        end_date: end,
        completed: true,
        subtasks: [],
      },
    ],
  };

  it('toDomain maps fields and subtask ids', () => {
    const t = TaskMapper.toDomain(dto, 'sec-1');
    expect(t.id).toBe('1');
    expect(t.sectionId).toBe('sec-1');
    expect(t.subtaskIds).toEqual(['2']);
  });

  it('toDomain maps camelCase date fields from API response', () => {
    const t = TaskMapper.toDomain(
      {
        id: 14,
        name: 'Task 2',
        description: '',
        startDate: '2026-04-29',
        endDate: '2026-05-08',
        completed: false,
        subtasks: [],
      },
      '36',
    );

    expect(t.startDate).toEqual(new Date('2026-04-29'));
    expect(t.endDate).toEqual(new Date('2026-05-08'));
  });

  it('flattenToDomain returns parent and nested tasks', () => {
    const flat = TaskMapper.flattenToDomain(dto, 'sec-1');
    expect(flat.map((x) => x.id)).toContain('1');
    expect(flat.map((x) => x.id)).toContain('2');
  });

  it('toCreateDto maps create payload from Task', () => {
    const task = TaskMapper.toDomain(
      { id: 1, name: 'N', description: 'd', start_date: start, end_date: end, completed: false },
      's',
    );
    const create = TaskMapper.toCreateDto(task);
    expect(create.name).toBe('N');
    expect(create.description).toBe('d');
    expect(create.start_date).toEqual(start);
    expect(create.end_date).toEqual(end);
    expect(create.completed).toBe(false);
  });

  it('toDto maps update payload using camelCase date fields', () => {
    const task = TaskMapper.toDomain(
      { id: 1, name: 'N', description: 'd', start_date: start, end_date: end, completed: false },
      's',
    );

    const update = TaskMapper.toDto(task);
    expect(update.name).toBe('N');
    expect(update.description).toBe('d');
    expect(update.startDate).toBe('2025-03-01');
    expect(update.endDate).toBe('2025-03-31');
    expect(update.completedDate).toBeUndefined();
  });

  it('toDto includes completedDate when task is completed with a completion timestamp', () => {
    const done = TaskMapper.toDomain(
      { id: 1, name: 'N', description: 'd', start_date: start, end_date: end, completed: false },
      's',
    ).complete();

    const update = TaskMapper.toDto(done);
    expect(update.completedDate).toBe(formatDateToISO(done.completedDate!));
  });
});
