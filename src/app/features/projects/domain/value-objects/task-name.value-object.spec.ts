import { describe, expect, it } from 'vitest';

import { TaskName } from './task-name.value-object';

describe('TaskName', () => {
  it('tryCreate trims whitespace', () => {
    const result = TaskName.tryCreate('  Prepare release  ');
    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error('Expected success result');
    }

    expect(result.value.value).toBe('Prepare release');
  });

  it('tryCreate rejects blank with code', () => {
    const result = TaskName.tryCreate('   ');
    expect(result).toEqual({ success: false, error: { code: 'TASK_NAME_REQUIRED' } });
  });

  it('tryCreate rejects too short with code and min', () => {
    const result = TaskName.tryCreate('x');
    expect(result).toEqual({ success: false, error: { code: 'TASK_NAME_TOO_SHORT', min: 2 } });
  });

  it('tryCreate rejects too long with code and max', () => {
    const result = TaskName.tryCreate('x'.repeat(51));
    expect(result).toEqual({ success: false, error: { code: 'TASK_NAME_TOO_LONG', max: 50 } });
  });
});
