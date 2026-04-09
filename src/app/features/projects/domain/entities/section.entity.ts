import { SectionName } from '@features/projects/domain/value-objects/section-name.value-object';

export class Section {
  public readonly name: string;

  constructor(
    public readonly id: string,
    name: string,
    public readonly projectId: string,
    public readonly taskIds: readonly string[]
  ) {
    const nameResult = SectionName.tryCreate(name);
    if (!nameResult.success) {
      throw new Error(Section.toMessage(nameResult.error.code));
    }

    this.name = nameResult.value.value;
  }

  static create(name: string, projectId: string, id?: string): Section {
    return new Section(
      id || crypto.randomUUID(),
      name,
      projectId,
      []
    );
  }

  addTask(taskId: string): Section {
    if (this.taskIds.includes(taskId)) {
      return this;
    }

    return new Section(
      this.id,
      this.name,
      this.projectId,
      [...this.taskIds, taskId]
    );
  }

  removeTask(taskId: string): Section {
    return new Section(
      this.id,
      this.name,
      this.projectId,
      this.taskIds.filter(id => id !== taskId)
    );
  }

  updateName(name: string): Section {
    return new Section(
      this.id,
      name,
      this.projectId,
      this.taskIds
    );
  }

  private static toMessage(code: string): string {
    switch (code) {
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
