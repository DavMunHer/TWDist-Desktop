import { ProjectName } from '@features/projects/domain/value-objects/project-name.value-object';

export class Project {
  constructor(
    public readonly id: string,
    public readonly name: ProjectName,
    public readonly favorite: boolean,
    public readonly sectionIds: readonly string[] = [],
  ) {}

  static create(name: ProjectName, favorite: boolean, id?: string): Project {
    return new Project(id ?? crypto.randomUUID(), name, favorite, []);
  }

  addSection(sectionId: string): Project {
    return new Project(this.id, this.name, this.favorite, [...this.sectionIds, sectionId]);
  }

  removeSection(sectionId: string): Project {
    return new Project(this.id, this.name, this.favorite, this.sectionIds.filter(id => id !== sectionId));
  }

  updateName(name: ProjectName): Project {
    return new Project(this.id, name, this.favorite, this.sectionIds);
  }

  toggleFavorite(): Project {
    return new Project(this.id, this.name, !this.favorite, this.sectionIds);
  }
}
