import { ProjectsError } from '@features/projects/application/errors/projects.error';
import { Result, fail, ok } from '@shared/utils/result';

export class SectionName {
  private constructor(public readonly value: string) {}

  static create(raw: string): SectionName {
    const result = SectionName.tryCreate(raw);
    if (!result.success) {
      throw new Error(SectionName.toMessage(result.error));
    }

    return result.value;
  }

  static tryCreate(raw: string): Result<SectionName, ProjectsError> {
    const value = raw.trim();

    if (!value) {
      return fail({ code: 'SECTION_NAME_REQUIRED' });
    }
    if (value.length < 2) {
      return fail({ code: 'SECTION_NAME_TOO_SHORT', min: 2 });
    }
    if (value.length > 50) {
      return fail({ code: 'SECTION_NAME_TOO_LONG', max: 50 });
    }

    return ok(new SectionName(value));
  }

  private static toMessage(error: ProjectsError): string {
    switch (error.code) {
      case 'SECTION_NAME_REQUIRED':
        return 'Section name is required';
      case 'SECTION_NAME_TOO_SHORT':
        return 'Section name must be at least 2 characters';
      case 'SECTION_NAME_TOO_LONG':
        return 'Section name must be at most 50 characters';
      default:
        return 'Invalid section name';
    }
  }
}
