export class Project {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly favorite: boolean,
    public readonly sectionIds: readonly string[] = [],
  ) {}

  addSection(sectionId: string): Project {
    return new Project(this.id, this.name, this.favorite, [...this.sectionIds, sectionId]);
  }

  removeSection(sectionId: string): Project {
    return new Project(this.id, this.name, this.favorite, this.sectionIds.filter(id => id !== sectionId));
  }

  updateName(name: string): Project {
    return new Project(this.id, name, this.favorite, this.sectionIds);
  }

  toggleFavorite(): Project {
    return new Project(this.id, this.name, !this.favorite, this.sectionIds);
  }
}
