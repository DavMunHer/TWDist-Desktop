export class Project {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly sectionIds: readonly string[]
  ) {}

  static create(name: string, id?: string): Project {
    return new Project(
      id || crypto.randomUUID(),
      name,
      []
    );
  }

  addSection(sectionId: string): Project {
    return new Project(
      this.id,
      this.name,
      [...this.sectionIds, sectionId]
    );
  }

  removeSection(sectionId: string): Project {
    return new Project(
      this.id,
      this.name,
      this.sectionIds.filter(id => id !== sectionId)
    );
  }

  updateName(name: string): Project {
    return new Project(
      this.id,
      name,
      this.sectionIds
    );
  }
}
