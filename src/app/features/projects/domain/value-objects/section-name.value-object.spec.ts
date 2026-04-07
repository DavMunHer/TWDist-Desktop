import { describe, expect, it } from 'vitest';

import { SectionName } from './section-name.value-object';

describe('SectionName', () => {
  it('tryCreate trims whitespace', () => {
    const result = SectionName.tryCreate('  Backlog  ');
    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error('Expected success result');
    }

    expect(result.value.value).toBe('Backlog');
  });

  it('tryCreate rejects blank with code', () => {
    const result = SectionName.tryCreate('   ');
    expect(result).toEqual({ success: false, error: { code: 'SECTION_NAME_REQUIRED' } });
  });

  it('tryCreate rejects too short with code and min', () => {
    const result = SectionName.tryCreate('x');
    expect(result).toEqual({ success: false, error: { code: 'SECTION_NAME_TOO_SHORT', min: 2 } });
  });

  it('tryCreate rejects too long with code and max', () => {
    const result = SectionName.tryCreate('x'.repeat(51));
    expect(result).toEqual({ success: false, error: { code: 'SECTION_NAME_TOO_LONG', max: 50 } });
  });

  it('create keeps legacy throw behavior for compatibility', () => {
    expect(() => SectionName.create('')).toThrow('Section name is required');
  });
});
