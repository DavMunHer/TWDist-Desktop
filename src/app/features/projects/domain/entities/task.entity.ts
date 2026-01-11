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
    public readonly completedDate?: Date
  ) {}

  static create(
    name: string,
    sectionId: string,
    startDate: Date = new Date(),
    id?: string
  ): Task {
    return new Task(
      id || crypto.randomUUID(),
      sectionId,
      name,
      false,
      startDate
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
      new Date()
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
      undefined
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
      this.completedDate
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
      this.completedDate
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
      this.completedDate
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
      this.completedDate
    );
  }
}
