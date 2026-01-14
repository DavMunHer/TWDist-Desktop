import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProjectRepository, ProjectAggregate } from '../../domain/repositories/project.repository';
import { ProjectDto } from '../dto/project.dto';
import { ProjectMapper } from '../mappers/project.mapper';

@Injectable()
export class HttpProjectRepository extends ProjectRepository {
  constructor(private http: HttpClient) {
    super();
  }

  findById(projectId: string): Observable<ProjectAggregate> {
    return this.http
      .get<ProjectDto>(`/projects/${projectId}`)
      .pipe(map(dto => ProjectMapper.toDomain(dto)));
  }

  save(project: any): Observable<any> {
    // Implementation for save
    throw new Error('Not implemented yet');
  }

  delete(projectId: string): Observable<void> {
    return this.http.delete<void>(`/projects/${projectId}`);
  }
}
