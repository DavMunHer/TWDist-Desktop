import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@shared/config/environment';
import { ProjectEvent, ProjectEventType } from '@features/projects/infrastructure/dto/sse/project-event';

@Injectable({ providedIn: 'root' })
export class ProjectEventsService {

  private static readonly EVENT_TYPES: ProjectEventType[] = [
    'section_created',
    'section_updated',
    'section_deleted',
    'task_created',
    'task_updated',
    'task_deleted',
  ];

  connect(projectId: string): Observable<ProjectEvent> {
    return new Observable(subscriber => {
      const url = `${environment.apiBaseUrl}/projects/${projectId}/events`;
      const source = new EventSource(url, { withCredentials: true });

      for (const type of ProjectEventsService.EVENT_TYPES) {
        source.addEventListener(type, ((e: MessageEvent) => {
          try {
            subscriber.next({ type, data: JSON.parse(e.data) });
          } catch (error) {
            console.error(`[SSE:Project] Failed to parse "${type}" event:`, error, e.data);
            subscriber.error(error);
          }
        }) as EventListener);
      }

      return () => source.close();
    });
  }
}
