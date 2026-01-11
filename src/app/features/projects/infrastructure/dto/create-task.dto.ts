export interface CreateTaskDto {
  name: string;
  description?: string;
  start_date?: Date;
  label?: string;
}
