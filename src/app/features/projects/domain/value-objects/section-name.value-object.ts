export class SectionName {
  private constructor(public readonly value: string) {}

  static create(raw: string): SectionName {
    const value = raw.trim();

    if (!value) {
      throw new Error('Section name is required');
    }
    if (value.length < 2) {
      throw new Error('Section name must be at least 2 characters');
    }
    if (value.length > 50) {
      throw new Error('Section name must be at most 50 characters');
    }

    return new SectionName(value);
  }
}
