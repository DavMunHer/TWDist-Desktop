import { SectionName } from '@features/projects/domain/value-objects/section-name.value-object';

export class Section {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly projectId: string,
    public readonly taskIds: readonly string[]
  ) {}

  static create(name: string, projectId: string, id?: string): Section {
    const sectionName = SectionName.create(name);
    return new Section(
      id || crypto.randomUUID(),
      sectionName.value,
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
    const sectionName = SectionName.create(name);
    return new Section(
      this.id,
      sectionName.value,
      this.projectId,
      this.taskIds
    );
  }
}
