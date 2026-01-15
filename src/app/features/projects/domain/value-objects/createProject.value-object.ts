export class CreateProject {
  constructor(
    public readonly name: string,
    public readonly favorite: boolean
  ) {
    // Domain validation
    if (!name) {
      throw new Error('Project name is required');
    }
  }

  static create(name: string, favorite: boolean): CreateProject {
    return new CreateProject(name, favorite);
  }
}
