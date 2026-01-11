import { TaskDto } from './task.dto';

export interface SectionDto {
  id: number;
  name: string;
  tasks: TaskDto[];
}
