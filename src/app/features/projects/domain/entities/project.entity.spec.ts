import { describe, it, expect } from 'vitest';
import { Project } from './project.entity';

describe('Project', () => {
  const base = new Project('p1', 'Alpha', false, ['s1', 's2']);

  it('addSection appends id immutably', () => {
    const next = base.addSection('s3');
    expect(base.sectionIds).toEqual(['s1', 's2']);
    expect(next.sectionIds).toEqual(['s1', 's2', 's3']);
  });

  it('removeSection drops id immutably', () => {
    const next = base.removeSection('s1');
    expect(next.sectionIds).toEqual(['s2']);
  });

  it('updateName returns new instance with same id', () => {
    const next = base.updateName('Beta');
    expect(next.id).toBe('p1');
    expect(next.name).toBe('Beta');
    expect(base.name).toBe('Alpha');
  });

  it('toggleFavorite flips flag', () => {
    const next = base.toggleFavorite();
    expect(next.favorite).toBe(true);
    expect(base.favorite).toBe(false);
  });
});
