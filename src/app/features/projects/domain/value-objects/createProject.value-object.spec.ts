import { describe, it, expect } from 'vitest';
import { CreateProject } from './createProject.value-object';

describe('CreateProject', () => {
  it('creates with name and favorite', () => {
    const vo = CreateProject.create('My app', true);
    expect(vo.name).toBe('My app');
    expect(vo.favorite).toBe(true);
  });

  it('throws when name is empty', () => {
    expect(() => new CreateProject('', false)).toThrow('Project name is required');
  });
});
