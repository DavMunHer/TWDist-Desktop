import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task } from '../../domain/entities/task.entity';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { TaskDto } from '../dto/task.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { TaskMapper } from '../mappers/task.mapper';
import { requiresAuthContext } from '@shared/interceptors/auth-context.token';

@Injectable()
export class HttpTaskRepository extends TaskRepository {
  constructor(private http: HttpClient) {
    super();
  }

  create(projectId: string, task: Task): Observable<Task> {
    const dto = TaskMapper.toCreateDto(task);
    return this.http
      .post<TaskDto>(`/projects/${projectId}/section/${task.sectionId}/task/create`, dto, requiresAuthContext())
      .pipe(map(responseDto => TaskMapper.toDomain(responseDto, task.sectionId, task.parentTaskId)));
  }

  update(projectId: string, task: Task): Observable<Task> {
    const dto = TaskMapper.toDto(task);
    return this.http
      .put<TaskDto>(`/projects/${projectId}/section/${task.sectionId}/task/${task.id}/update`, dto, requiresAuthContext())
      .pipe(map(responseDto => TaskMapper.toDomain(responseDto, task.sectionId, task.parentTaskId)));
  }

  delete(projectId: string, sectionId: string, taskId: string): Observable<void> {
    return this.http.delete<void>(`/projects/${projectId}/section/${sectionId}/task/${taskId}/delete`, requiresAuthContext());
  }

  findById(projectId: string, sectionId: string, taskId: string): Observable<Task> {
    return this.http
      .get<TaskDto>(`/projects/${projectId}/section/${sectionId}/task/${taskId}/get`, requiresAuthContext())
      .pipe(map(dto => TaskMapper.toDomain(dto, sectionId)));
  }
}
