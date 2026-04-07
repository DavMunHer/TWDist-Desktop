import { ProjectsError } from '@features/projects/application/errors/projects.error';
import { Result, fail, ok } from '@shared/utils/result';

export class ProjectName {
  private constructor(public readonly value: string) {}

  static create(raw: string): ProjectName {
    const result = ProjectName.tryCreate(raw);
    if (!result.success) {
      throw new Error(ProjectName.toMessage(result.error));
    }

    return result.value;
  }

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

  private static toMessage(error: ProjectsError): string {
    switch (error.code) {
      case 'PROJECT_NAME_REQUIRED':
        return 'Project name is required';
      case 'PROJECT_NAME_TOO_SHORT':
        return 'Project name must be at least 2 characters';
      case 'PROJECT_NAME_TOO_LONG':
        return 'Project name must be at most 50 characters';
      default:
        return 'Invalid project name';
    }
  }
}
