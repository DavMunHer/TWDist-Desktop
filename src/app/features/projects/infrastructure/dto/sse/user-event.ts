import { ProjectSummaryDto } from '@features/projects/infrastructure/dto/response/project-summary.dto';

export type UserEventType =
  | 'project_created'
  | 'project_updated'
  | 'project_deleted';

export interface UserEvent<T = unknown> {
  type: UserEventType;
  data: T;
}

export interface ProjectDeletePayload {
  id: number;
}

export type ProjectCreatedEvent = UserEvent<ProjectSummaryDto>;
export type ProjectUpdatedEvent = UserEvent<ProjectSummaryDto>;
export type ProjectDeletedEvent = UserEvent<ProjectDeletePayload>;
