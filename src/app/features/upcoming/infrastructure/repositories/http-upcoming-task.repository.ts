import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { UpcomingTaskAggregate } from '@features/upcoming/domain/models/upcoming-task.aggregate';
import { UpcomingTaskRepository } from '@features/upcoming/domain/repositories/upcoming-task.repository';
import { UpcomingTaskDto } from '@features/upcoming/infrastructure/dto/upcoming-task.dto';
import { UpcomingTaskMapper } from '@features/upcoming/infrastructure/mappers/upcoming-task.mapper';
import { requiresAuthContext } from '@shared/interceptors/auth-context.token';
import { formatDateToISO } from '@shared/utils/date.util';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class HttpUpcomingTaskRepository extends UpcomingTaskRepository {
  private readonly http = inject(HttpClient);

  findUpcomingTasks(from: Date, to: Date): Observable<UpcomingTaskAggregate[]> {
    const params = new HttpParams()
      .set('from', formatDateToISO(from))
      .set('to', formatDateToISO(to));

    return this.http
      .get<UpcomingTaskDto[]>('/tasks/upcoming', {
        ...requiresAuthContext(),
        params,
      })
      .pipe(map((dtos) => UpcomingTaskMapper.toDomainAggregates(dtos)));
  }
}
