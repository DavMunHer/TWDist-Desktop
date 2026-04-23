import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task } from '@features/projects/domain/entities/task.entity';
import { TaskRepository } from '@features/projects/domain/repositories/task.repository';
import { TaskDto } from '@features/projects/infrastructure/dto/task.dto';
import { CompleteTaskDto } from '@features/projects/infrastructure/dto/complete-task.dto';
import { TaskMapper } from '@features/projects/infrastructure/mappers/task.mapper';
import { requiresAuthContext } from '@shared/interceptors/auth-context.token';

@Injectable()
export class HttpTaskRepository extends TaskRepository {
  private http = inject(HttpClient);


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

  complete(projectId: string, sectionId: string, taskId: string, completedDate: string): Observable<Task> {
    const dto: CompleteTaskDto = { completedDate };
    return this.http
      .patch<TaskDto>(`/projects/${projectId}/section/${sectionId}/task/${taskId}/complete`, dto, requiresAuthContext())
      .pipe(map(responseDto => TaskMapper.toDomain(responseDto, sectionId)));
  }

  uncomplete(projectId: string, sectionId: string, taskId: string): Observable<Task> {
    return this.http
      .post<TaskDto>(`/projects/${projectId}/section/${sectionId}/task/${taskId}/uncomplete`, {}, requiresAuthContext())
      .pipe(map(responseDto => TaskMapper.toDomain(responseDto, sectionId)));
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
