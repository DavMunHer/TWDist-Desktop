import { Observable } from 'rxjs';
import { Project } from '../entities/project.entity';
import { Section } from '../entities/section.entity';
import { Task } from '../entities/task.entity';
import { ProjectDto } from '../../infrastructure/dto/project.dto';

export interface ProjectAggregate {
  project: Project;
  sections: Section[];
  tasks: Task[];
}

export interface ProjectSummary {
  project: Project;
  pendingCount: number;
}

export abstract class ProjectRepository {
  abstract create(project: ProjectDto): Observable<Project>;
  abstract findById(projectId: string): Observable<ProjectAggregate>;
  abstract getAll(): Observable<ProjectSummary[]>;
  abstract update(project: ProjectDto): Observable<Project>;
  abstract delete(projectId: string): Observable<void>;
  abstract toggleFavorite(projectId: string, favorite: boolean): Observable<void>;
}
