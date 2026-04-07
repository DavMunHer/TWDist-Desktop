import { ProjectsError } from '@features/projects/application/errors/projects.error';

export interface UiError {
  code: string;
  kind: 'validation' | 'network' | 'unexpected';
  message: string;
  fieldErrors?: Record<string, string>;
  retryable?: boolean;
}

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
