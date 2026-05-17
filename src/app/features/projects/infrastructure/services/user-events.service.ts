import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { UserEvent, UserEventType } from '@features/projects/infrastructure/dto/sse/user-event';
import { SseRuntimeService } from '@shared/infrastructure/sse/sse-runtime';

@Injectable({ providedIn: 'root' })
export class UserEventsService {
  private readonly sseRuntime = inject(SseRuntimeService);

  private static readonly EVENT_TYPES: UserEventType[] = [
    'project_created',
    'project_updated',
    'project_deleted',
  ];

  connect(): Observable<UserEvent> {
    return this.sseRuntime.connect<UserEventType>('/users/events', UserEventsService.EVENT_TYPES).pipe(
      map(({ type, data }) => ({ type, data }) as UserEvent),
    );
  }
}
