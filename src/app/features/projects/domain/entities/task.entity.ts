export class Task {
  constructor(
    public readonly id: string,
    public readonly sectionId: string,
    public readonly name: string,
    public readonly completed: boolean,
    public readonly startDate: Date,
    public readonly description?: string,
    public readonly label?: string,
    public readonly endDate?: Date,
    public readonly completedDate?: Date,
    public readonly parentTaskId?: string,
    public readonly subtaskIds: readonly string[] = [],
  ) {}

  static create(
    name: string,
    sectionId: string,
    startDate: Date = new Date(),
    id?: string,
    parentTaskId?: string
  ): Task {
    return new Task(
      id || crypto.randomUUID(),
      sectionId,
      name,
      false,
      startDate,
      undefined,
      undefined,
      undefined,
      undefined,
      parentTaskId,
    );
  }

  complete(): Task {
    return new Task(
      this.id,
      this.sectionId,
      this.name,
      true,
      this.startDate,
      this.description,
      this.label,
      this.endDate,
      new Date(),
      this.parentTaskId,
      this.subtaskIds,
    );
  }

  uncomplete(): Task {
    return new Task(
      this.id,
      this.sectionId,
      this.name,
      false,
      this.startDate,
      this.description,
      this.label,
      this.endDate,
      undefined,
      this.parentTaskId,
      this.subtaskIds,
    );
  }

  updateName(name: string): Task {
    return new Task(
      this.id,
      this.sectionId,
      name,
      this.completed,
      this.startDate,
      this.description,
      this.label,
      this.endDate,
      this.completedDate,
      this.parentTaskId,
      this.subtaskIds,
    );
  }

  updateDescription(description: string): Task {
    return new Task(
      this.id,
      this.sectionId,
      this.name,
      this.completed,
      this.startDate,
      description,
      this.label,
      this.endDate,
      this.completedDate,
      this.parentTaskId,
      this.subtaskIds,
    );
  }

  setLabel(label: string): Task {
    return new Task(
      this.id,
      this.sectionId,
      this.name,
      this.completed,
      this.startDate,
      this.description,
      label,
      this.endDate,
      this.completedDate,
      this.parentTaskId,
      this.subtaskIds,
    );
  }

  setEndDate(endDate: Date): Task {
    return new Task(
      this.id,
      this.sectionId,
      this.name,
      this.completed,
      this.startDate,
      this.description,
      this.label,
      endDate,
      this.completedDate,
      this.parentTaskId,
      this.subtaskIds,
    );
  }

  addSubtask(subtaskId: string): Task {
    return new Task(
      this.id,
      this.sectionId,
      this.name,
      this.completed,
      this.startDate,
      this.description,
      this.label,
      this.endDate,
      this.completedDate,
      this.parentTaskId,
      [...this.subtaskIds, subtaskId],
    );
  }

  removeSubtask(subtaskId: string): Task {
    return new Task(
      this.id,
      this.sectionId,
      this.name,
      this.completed,
      this.startDate,
      this.description,
      this.label,
      this.endDate,
      this.completedDate,
      this.parentTaskId,
      this.subtaskIds.filter(id => id !== subtaskId),
    );
  }
}
