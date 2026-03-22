import { describe, it, expect } from 'vitest';

import { ProjectName } from './project-name.value-object';

describe('ProjectName', () => {
  it('create trims whitespace', () => {
    expect(ProjectName.create('  ab  ').value).toBe('ab');
  });

  it('rejects blank', () => {
    expect(() => ProjectName.create('   ')).toThrow('Project name is required');
  });

  it('rejects too short', () => {
    expect(() => ProjectName.create('a')).toThrow('at least 2 characters');
  });

  it('rejects too long', () => {
    expect(() => ProjectName.create('x'.repeat(51))).toThrow('at most 50 characters');
  });
});
