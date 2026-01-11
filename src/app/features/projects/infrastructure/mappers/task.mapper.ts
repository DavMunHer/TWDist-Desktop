import { Task } from '../../domain';
import { TaskDto, CreateTaskDto } from '../dto';

export class TaskMapper {
  static toDomain(dto: TaskDto, sectionId: string): Task {
    return new Task(
      String(dto.id),
      sectionId,
      dto.name,
      dto.completed,
      dto.start_date,
      dto.description,
      dto.label,
      dto.end_date
    );
  }

  static toCreateDto(task: Task): CreateTaskDto {
    return {
      name: task.name,
      description: task.description,
      start_date: task.startDate,
      label: task.label,
    };
  }

  static toDto(task: Task): Partial<TaskDto> {
    return {
      name: task.name,
      description: task.description,
      start_date: task.startDate,
      end_date: task.endDate,
      completed: task.completed,
      label: task.label,
    };
  }
}
