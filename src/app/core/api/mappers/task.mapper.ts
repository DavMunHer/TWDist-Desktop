import { TWDTask } from '../../../models/task';
import { TaskDto } from '../dto/task/task.dto';

// Leaf mapper
export function taskFromDto(dto: TaskDto, sectionId: string): TWDTask {
  return {
    id: String(dto.id),
    sectionId,
    taskName: dto.name,
    startDate: dto.start_date,
    end_date: dto.end_date,
    description: dto.description,
    label: dto.label,
    completed: dto.completed,
  };
}
