import { describe, it, expect } from 'vitest';
import { Task } from './task.entity';

describe('Task', () => {
  const start = new Date('2025-06-01');
  const base = new Task('t1', 'sec', 'Write docs', false, start, undefined, undefined, undefined, undefined, undefined, []);

  it('create sets completed false', () => {
    const t = Task.create('New', 'sec', start, 'tid');
    expect(t.id).toBe('tid');
    expect(t.completed).toBe(false);
    expect(t.name).toBe('New');
  });

  it('complete sets completed true and completedDate', () => {
    const done = base.complete();
    expect(done.completed).toBe(true);
    expect(done.completedDate).toBeInstanceOf(Date);
  });

  it('uncomplete clears completedDate', () => {
    const done = base.complete();
    const open = done.uncomplete();
    expect(open.completed).toBe(false);
    expect(open.completedDate).toBeUndefined();
  });

  it('updateName returns new instance', () => {
    const next = base.updateName('Renamed');
    expect(next.name).toBe('Renamed');
    expect(base.name).toBe('Write docs');
  });
});
