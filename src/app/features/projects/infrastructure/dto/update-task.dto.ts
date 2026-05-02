export interface UpdateTaskDto {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  /** Set when marking complete via task update (e.g. edit modal); omit otherwise. Backend infers completion from this. */
  completedDate?: string;
  label?: string;
}
