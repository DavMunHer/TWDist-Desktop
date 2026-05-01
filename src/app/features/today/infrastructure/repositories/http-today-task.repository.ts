import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { requiresAuthContext } from '@shared/interceptors/auth-context.token';
import { TodayTaskRepository } from '@features/today/domain/repositories/today-task.repository';
import { TodayTaskAggregate } from '@features/today/domain/models/today-task.aggregate';
import { TodayTaskDto } from '@features/today/infrastructure/dto/today-task.dto';
import { TodayTaskMapper } from '@features/today/infrastructure/mappers/today-task.mapper';

@Injectable()
export class HttpTodayTaskRepository extends TodayTaskRepository {
  private readonly http = inject(HttpClient);

  findTodayTasks(): Observable<TodayTaskAggregate[]> {
    return this.http
      .get<TodayTaskDto[]>('/tasks/today', requiresAuthContext())
      .pipe(map((dtos) => TodayTaskMapper.toDomainAggregates(dtos)));
  }
}

