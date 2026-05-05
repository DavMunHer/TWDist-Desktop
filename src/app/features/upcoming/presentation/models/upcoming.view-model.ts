import { TaskViewModel } from '@features/projects/presentation/models/project.view-model';

export interface UpcomingTaskViewModel extends TaskViewModel {
  sectionId: string;
}

export interface UpcomingGroupViewModel {
  label: string;
  dateLabel: string;
  isToday: boolean;
  tasks: UpcomingTaskViewModel[];
}

export interface WeekRange {
  start: Date;
  end: Date;
  label: string;
}
