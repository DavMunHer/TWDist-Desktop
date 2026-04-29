export interface UpdateTaskDto {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  completed?: boolean;
  label?: string;
}
