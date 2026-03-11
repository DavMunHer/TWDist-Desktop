import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../shared/config/environment';
import { UserEvent, UserEventType } from '../dto/sse/user-event';

@Injectable({ providedIn: 'root' })
export class UserEventsService {

  private static readonly EVENT_TYPES: UserEventType[] = [
    'project_created',
    'project_updated',
    'project_deleted',
  ];

  connect(): Observable<UserEvent> {
    return new Observable(subscriber => {
      const url = `${environment.apiBaseUrl}/users/events`;
      const source = new EventSource(url, { withCredentials: true });

      for (const type of UserEventsService.EVENT_TYPES) {
        source.addEventListener(type, ((e: MessageEvent) => {
          try {
            subscriber.next({ type, data: JSON.parse(e.data) });
          } catch { /* malformed event data */ }
        }) as EventListener);
      }

      return () => source.close();
    });
  }
}
