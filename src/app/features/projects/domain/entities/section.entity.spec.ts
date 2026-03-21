import { describe, it, expect } from 'vitest';
import { Section } from './section.entity';

describe('Section', () => {
  const base = new Section('sec-1', 'Backlog', 'p1', ['t1']);

  it('create uses provided id when given', () => {
    const s = Section.create('Inbox', 'p9', 'fixed-id');
    expect(s.id).toBe('fixed-id');
    expect(s.name).toBe('Inbox');
    expect(s.projectId).toBe('p9');
    expect(s.taskIds).toEqual([]);
  });

  it('addTask appends task id', () => {
    const next = base.addTask('t2');
    expect(next.taskIds).toEqual(['t1', 't2']);
  });

  it('removeTask filters task id', () => {
    const next = base.removeTask('t1');
    expect(next.taskIds).toEqual([]);
  });

  it('updateName preserves id and projectId', () => {
    const next = base.updateName('Done');
    expect(next.name).toBe('Done');
    expect(next.id).toBe('sec-1');
    expect(next.projectId).toBe('p1');
  });
});
