import { describe, it, expect } from 'vitest';

import { ProjectName } from './project-name.value-object';

describe('ProjectName', () => {
  it('tryCreate trims whitespace', () => {
    const result = ProjectName.tryCreate('  ab  ');
    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error('Expected success result');
    }

    expect(result.value.value).toBe('ab');
  });

  it('tryCreate rejects blank with code', () => {
    const result = ProjectName.tryCreate('   ');
    expect(result).toEqual({ success: false, error: { code: 'PROJECT_NAME_REQUIRED' } });
  });

  it('tryCreate rejects too short with code and min', () => {
    const result = ProjectName.tryCreate('a');
    expect(result).toEqual({ success: false, error: { code: 'PROJECT_NAME_TOO_SHORT', min: 2 } });
  });

  it('tryCreate rejects too long with code and max', () => {
    const result = ProjectName.tryCreate('x'.repeat(51));
    expect(result).toEqual({ success: false, error: { code: 'PROJECT_NAME_TOO_LONG', max: 50 } });
  });

  it('create keeps legacy throw behavior for compatibility', () => {
    expect(() => ProjectName.create('')).toThrow('Project name is required');
  });
});
