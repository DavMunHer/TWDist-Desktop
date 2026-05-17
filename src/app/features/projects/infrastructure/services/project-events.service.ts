import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ProjectEvent, ProjectEventType } from '@features/projects/infrastructure/dto/sse/project-event';
import { SseRuntimeService } from '@shared/infrastructure/sse/sse-runtime';

@Injectable({ providedIn: 'root' })
export class ProjectEventsService {
  private readonly sseRuntime = inject(SseRuntimeService);

  private static readonly EVENT_TYPES: ProjectEventType[] = [
    'section_created',
    'section_updated',
    'section_deleted',
    'task_created',
    'task_updated',
    'task_deleted',
  ];

  connect(projectId: string): Observable<ProjectEvent> {
    return this.sseRuntime
      .connect<ProjectEventType>(
        `/projects/${projectId}/events`,
        ProjectEventsService.EVENT_TYPES,
      )
      .pipe(map(({ type, data }) => ({ type, data }) as ProjectEvent));
  }
}
