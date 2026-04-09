import { describe, it, expect } from 'vitest';
import { Project } from './project.entity';
import { ProjectName } from '@features/projects/domain/value-objects/project-name.value-object';

function validProjectName(value: string): ProjectName {
  const result = ProjectName.tryCreate(value);
  if (!result.success) {
    throw new Error('Invalid test project name');
  }

  return result.value;
}

describe('Project', () => {
  const base = new Project('p1', validProjectName('Alpha'), false, ['s1', 's2']);

  it('create uses random id when omitted', () => {
    const p = Project.create(validProjectName('Xy'), true);
    expect(p.id.length).toBeGreaterThan(0);
    expect(p.name.value).toBe('Xy');
    expect(p.favorite).toBe(true);
    expect(p.sectionIds).toEqual([]);
  });

  it('create accepts explicit id for optimistic UI', () => {
    const p = Project.create(validProjectName('Ab'), false, 'temp-1');
    expect(p.id).toBe('temp-1');
  });

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
    const next = base.updateName(validProjectName('Beta'));
    expect(next.id).toBe('p1');
    expect(next.name.value).toBe('Beta');
    expect(base.name.value).toBe('Alpha');
  });

  it('toggleFavorite flips flag', () => {
    const next = base.toggleFavorite();
    expect(next.favorite).toBe(true);
    expect(base.favorite).toBe(false);
  });
});
