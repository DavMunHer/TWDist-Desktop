import { Task } from '../../domain/entities/task.entity';
import { TaskDto } from '../dto/task.dto';
import { CreateTaskDto } from '../dto/create-task.dto';

export class TaskMapper {
  /**
   * Maps a single TaskDto to a domain Task.
   * Subtask IDs are derived from the nested `subtasks` array in the DTO.
   */
  static toDomain(dto: TaskDto, sectionId: string, parentTaskId?: string): Task {
    const subtaskIds = (dto.subtasks ?? []).map(s => String(s.id));
    return new Task(
      String(dto.id),
      sectionId,
      dto.name,
      dto.completed,
      dto.start_date,
      dto.description,
      dto.label,
      dto.end_date,
      undefined,
      parentTaskId,
      subtaskIds,
    );
  }

  /**
   * Recursively flattens a TaskDto tree into a flat Task array.
   * Used during normalization so every task (and subtask) gets its own
   * entry in the store's `tasks` dictionary.
   */
  static flattenToDomain(dto: TaskDto, sectionId: string, parentTaskId?: string): Task[] {
    const task = TaskMapper.toDomain(dto, sectionId, parentTaskId);
    const subtasks = (dto.subtasks ?? []).flatMap(sub =>
      TaskMapper.flattenToDomain(sub, sectionId, String(dto.id))
    );
    return [task, ...subtasks];
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
