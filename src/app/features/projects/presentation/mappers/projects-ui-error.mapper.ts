import { ProjectsError } from '@features/projects/application/errors/projects.error';
import { UiError } from '@features/projects/presentation/models/ui-error';

export function toProjectsUiError(error: ProjectsError): UiError {
  switch (error.code) {
    case 'PROJECT_NAME_REQUIRED':
      return {
        code: error.code,
        kind: 'validation',
        message: 'Project name is required',
        fieldErrors: { projectName: 'Project name is required' },
        retryable: false,
      };
    case 'PROJECT_NAME_TOO_SHORT':
      return {
        code: error.code,
        kind: 'validation',
        message: 'Project name is too short',
        fieldErrors: { projectName: `Minimum ${String(error.min)} characters` },
        retryable: false,
      };
    case 'PROJECT_NAME_TOO_LONG':
      return {
        code: error.code,
        kind: 'validation',
        message: 'Project name is too long',
        fieldErrors: { projectName: `Maximum ${String(error.max)} characters` },
        retryable: false,
      };
    case 'SECTION_NAME_REQUIRED':
      return {
        code: error.code,
        kind: 'validation',
        message: 'Section name is required',
        fieldErrors: { sectionName: 'Section name is required' },
        retryable: false,
      };
    case 'SECTION_NAME_TOO_SHORT':
      return {
        code: error.code,
        kind: 'validation',
        message: 'Section name is too short',
        fieldErrors: { sectionName: `Minimum ${String(error.min)} characters` },
        retryable: false,
      };
    case 'SECTION_NAME_TOO_LONG':
      return {
        code: error.code,
        kind: 'validation',
        message: 'Section name is too long',
        fieldErrors: { sectionName: `Maximum ${String(error.max)} characters` },
        retryable: false,
      };
    case 'TASK_NAME_REQUIRED':
      return {
        code: error.code,
        kind: 'validation',
        message: 'Task name is required',
        fieldErrors: { taskName: 'Task name is required' },
        retryable: false,
      };
    case 'TASK_NAME_TOO_SHORT':
      return {
        code: error.code,
        kind: 'validation',
        message: 'Task name is too short',
        fieldErrors: { taskName: `Minimum ${String(error.min)} characters` },
        retryable: false,
      };
    case 'TASK_NAME_TOO_LONG':
      return {
        code: error.code,
        kind: 'validation',
        message: 'Task name is too long',
        fieldErrors: { taskName: `Maximum ${String(error.max)} characters` },
        retryable: false,
      };
    case 'NETWORK_ERROR':
      return {
        code: error.code,
        kind: 'network',
        message: 'Network error. Please try again.',
        retryable: true,
      };
    case 'UNEXPECTED_ERROR':
      return {
        code: error.code,
        kind: 'unexpected',
        message: 'Unexpected error. Please try again.',
        retryable: true,
      };
  }
}
