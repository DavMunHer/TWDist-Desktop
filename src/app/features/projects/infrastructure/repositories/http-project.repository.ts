import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProjectRepository, ProjectAggregate, ProjectSummary } from '@features/projects/domain/repositories/project.repository';
import { ProjectMapper } from '@features/projects/infrastructure/mappers/project.mapper';
import { Project } from '@features/projects/domain/entities/project.entity';
import { ProjectResponeDto } from '@features/projects/infrastructure/dto/response/project.dto';
import { ProjectSummaryDto } from '@features/projects/infrastructure/dto/response/project-summary.dto';
import { requiresAuthContext } from '@shared/interceptors/auth-context.token';

@Injectable()
export class HttpProjectRepository extends ProjectRepository {

  constructor(private http: HttpClient) {
    super();
  }

  private baseUrl = '/projects';

  create(project: Project): Observable<Project> {
    return this.http.post<ProjectResponeDto>(`${this.baseUrl}/create`, ProjectMapper.toDto(project), requiresAuthContext())
      .pipe(map(responseDto => ProjectMapper.toDomain(responseDto)));
  }

  findById(projectId: string): Observable<ProjectAggregate> {
    return this.http
      .get<ProjectResponeDto>(`${this.baseUrl}/${projectId}`, requiresAuthContext())
      .pipe(map(dto => ProjectMapper.toAggregate(dto)));
  }

  getAll(): Observable<ProjectSummary[]> {
    return this.http
      .get<ProjectSummaryDto[]>(`${this.baseUrl}/get`, requiresAuthContext())
      .pipe(map(dtos => dtos.map(dto => ProjectMapper.toSummary(dto))));
  }

  update(project: Project): Observable<Project> {
    return this.http.put<ProjectResponeDto>(`${this.baseUrl}/${project.id}/update`, ProjectMapper.toDto(project), requiresAuthContext())
      .pipe(map(responseDto => ProjectMapper.toDomain(responseDto)));
  }

  delete(projectId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${projectId}/delete`, requiresAuthContext());
  }

  toggleFavorite(projectId: string, favorite: boolean): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${projectId}/favorite`, { favorite }, requiresAuthContext());
  }
}
