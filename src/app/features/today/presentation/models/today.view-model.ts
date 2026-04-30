import { TaskViewModel } from '@features/projects/presentation/models/project.view-model';

export interface TodayTaskViewModel extends TaskViewModel {
  /** Section ID used by TaskComponent for delete/edit events */
  sectionId: string;
}

export interface TodayGroupViewModel {
  /** Display label for the group day (e.g. "Today", "Friday, May 1") */
  label: string;
  tasks: TodayTaskViewModel[];
}
