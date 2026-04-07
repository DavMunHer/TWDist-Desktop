import { ProjectsError } from '@features/projects/application/errors/projects.error';
import { Result, fail, ok } from '@shared/utils/result';

export class ProjectName {
  private constructor(public readonly value: string) {}

  static tryCreate(raw: string): Result<ProjectName, ProjectsError> {
    const value = raw.trim();

    if (!value) {
      return fail({ code: 'PROJECT_NAME_REQUIRED' });
    }
    if (value.length < 2) {
      return fail({ code: 'PROJECT_NAME_TOO_SHORT', min: 2 });
    }
    if (value.length > 50) {
      return fail({ code: 'PROJECT_NAME_TOO_LONG', max: 50 });
    }

    return ok(new ProjectName(value));
  }
}
