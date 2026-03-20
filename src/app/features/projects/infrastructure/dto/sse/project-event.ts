import { SectionDto } from '@features/projects/infrastructure/dto/section.dto';
import { TaskDto } from '@features/projects/infrastructure/dto/task.dto';

export type ProjectEventType =
  | 'section_created'
  | 'section_updated'
  | 'section_deleted'
  | 'task_created'
  | 'task_updated'
  | 'task_deleted';

export interface ProjectEvent<T = unknown> {
  type: ProjectEventType;
  data: T;
}

export interface DeletePayload {
  id: number;
  sectionId?: number;
}

export type SectionEvent = ProjectEvent<SectionDto>;
export type TaskEvent = ProjectEvent<TaskDto>;
export type DeleteEvent = ProjectEvent<DeletePayload>;
