import { TaskDto } from '@features/projects/infrastructure/dto/task.dto';

export interface SectionDto {
  id: number;
  name: string;
  tasks: TaskDto[];
}
