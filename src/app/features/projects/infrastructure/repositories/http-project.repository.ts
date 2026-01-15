import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProjectRepository, ProjectAggregate } from '../../domain/repositories/project.repository';
import { ProjectDto } from '../dto/project.dto';
import { ProjectMapper } from '../mappers/project.mapper';
import { Project } from '../../domain/entities/project.entity';
import { ProjectResponeDto } from '../dto/response/project.dto';

@Injectable()
export class HttpProjectRepository extends ProjectRepository {

  constructor(private http: HttpClient) {
    super();
  }

  private baseUrl = '/projects';

  create(project: ProjectDto): Observable<Project> {
    return this.http.post<ProjectResponeDto>(`${this.baseUrl}/create`, project)
      .pipe(map(responseDto => ProjectMapper.toDomain(responseDto)));
  }

  findById(projectId: string): Observable<Project> {
    return this.http
      .get<ProjectResponeDto>(`${this.baseUrl}/${projectId}`)
      .pipe(map(dto => ProjectMapper.toDomain(dto)));
  }

  getAll(): Observable<Project[]> {
    return this.http
      .get<ProjectResponeDto[]>(`${this.baseUrl}/get`)
      .pipe(map(dtos => dtos.map(dto => ProjectMapper.toDomain(dto))));
  }

  update(project: ProjectDto): Observable<Project> {
    return this.http.put<ProjectResponeDto>(`${this.baseUrl}/${project.id}/update`, project)
      .pipe(map(responseDto => ProjectMapper.toDomain(responseDto)));
  }

  delete(projectId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${projectId}/delete`);
  }
}
