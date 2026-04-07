export type ProjectsError =
  | { code: 'PROJECT_NAME_REQUIRED' }
  | { code: 'PROJECT_NAME_TOO_SHORT'; min: number }
  | { code: 'PROJECT_NAME_TOO_LONG'; max: number }
  | { code: 'SECTION_NAME_REQUIRED' }
  | { code: 'SECTION_NAME_TOO_SHORT'; min: number }
  | { code: 'SECTION_NAME_TOO_LONG'; max: number }
  | { code: 'NETWORK_ERROR' }
  | { code: 'UNEXPECTED_ERROR' };
