export interface TaskDto {
  id: number;
  name: string;
  description: string;
  start_date?: Date | string | null;
  end_date?: Date | string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  completedDate?: Date | string | null;
  completed: boolean;
  label?: string;
  parent_task_id?: number;
  sectionId?: number | string;
  subtasks?: TaskDto[];
}
