export class ProjectName {
  private constructor(public readonly value: string) {}

  static create(raw: string): ProjectName {
    const value = raw.trim();

    if (!value) {
      throw new Error('Project name is required');
    }
    if (value.length < 2) {
      throw new Error('Project name must be at least 2 characters');
    }
    if (value.length > 50) {
      throw new Error('Project name must be at most 50 characters');
    }

    return new ProjectName(value);
  }
}
