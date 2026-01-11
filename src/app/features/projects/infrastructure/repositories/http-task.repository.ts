import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task } from '../../domain/entities/task.entity';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { TaskDto } from '../dto/task.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { TaskMapper } from '../mappers/task.mapper';

@Injectable()
export class HttpTaskRepository extends TaskRepository {
  constructor(private http: HttpClient) {
    super();
  }

  create(task: Task): Observable<Task> {
    const dto = TaskMapper.toCreateDto(task);
    return this.http
      .post<TaskDto>(`/api/sections/${task.sectionId}/tasks`, dto)
      .pipe(map(responseDto => TaskMapper.toDomain(responseDto, task.sectionId)));
  }

  update(task: Task): Observable<Task> {
    const dto = TaskMapper.toDto(task);
    return this.http
      .put<TaskDto>(`/api/tasks/${task.id}`, dto)
      .pipe(map(responseDto => TaskMapper.toDomain(responseDto, task.sectionId)));
  }

  delete(taskId: string): Observable<void> {
    return this.http.delete<void>(`/api/tasks/${taskId}`);
  }

  findById(taskId: string): Observable<Task> {
    throw new Error('Not implemented yet');
  }
}
