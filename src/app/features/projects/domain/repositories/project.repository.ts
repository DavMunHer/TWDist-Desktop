import { Observable } from 'rxjs';
import { Project } from '../entities/project.entity';
import { Section } from '../entities/section.entity';
import { Task } from '../entities/task.entity';

export interface ProjectAggregate {
  project: Project;
  sections: Section[];
  tasks: Task[];
}

export abstract class ProjectRepository {
  abstract findById(projectId: string): Observable<ProjectAggregate>;
  abstract save(project: Project): Observable<Project>;
  abstract delete(projectId: string): Observable<void>;
}
