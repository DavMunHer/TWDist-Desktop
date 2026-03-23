import { Injectable } from "@angular/core";
import { ProjectRepository } from "@features/projects/domain/repositories/project.repository";
import { Observable } from "rxjs";
import { Project } from "@features/projects/domain/entities/project.entity";
import { ProjectName } from "@features/projects/domain/value-objects/project-name.value-object";
import { toProjectOutput } from '@features/projects/application/mappers/project-output.mapper';
import { map } from "rxjs/operators";

export interface CreateProjectInput {
  name: string;
  favorite: boolean;
}

export interface CreateProjectOutput {
  id: string;
  name: string;
  favorite: boolean;
  sectionIds: string[];
}

@Injectable()
export class CreateProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  execute(input: CreateProjectInput): Observable<CreateProjectOutput> {
    const projectName = ProjectName.create(input.name);
    const project = Project.create(projectName, input.favorite);

    return this.projectRepository.create(project).pipe(
      map((saved) => toProjectOutput(saved, [])),
    );
  }
}
