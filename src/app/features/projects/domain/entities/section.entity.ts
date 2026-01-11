export class Section {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly projectId: string,
    public readonly taskIds: readonly string[]
  ) {}

  static create(name: string, projectId: string, id?: string): Section {
    return new Section(
      id || crypto.randomUUID(),
      name,
      projectId,
      []
    );
  }

  addTask(taskId: string): Section {
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
}
