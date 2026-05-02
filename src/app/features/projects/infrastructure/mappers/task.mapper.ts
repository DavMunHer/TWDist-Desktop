import { Task } from '@features/projects/domain/entities/task.entity';
import { TaskDto } from '@features/projects/infrastructure/dto/task.dto';
import { CreateTaskDto } from '@features/projects/infrastructure/dto/create-task.dto';
import { UpdateTaskDto } from '@features/projects/infrastructure/dto/update-task.dto';
import { formatDateToISO } from '@shared/utils/date.util';

export class TaskMapper {
  /**
   * Maps a single TaskDto to a domain Task.
   * Subtask IDs are derived from the nested `subtasks` array in the DTO.
   */
  static toDomain(dto: TaskDto, sectionId: string, parentTaskId?: string): Task {
    const subtaskIds = (dto.subtasks ?? []).map(s => String(s.id));
    const startDate = TaskMapper.parseDate(dto.startDate ?? dto.start_date);
    const endDate = TaskMapper.parseDate(dto.endDate ?? dto.end_date);
    return new Task(
      String(dto.id),
      sectionId,
      dto.name,
      dto.completed,
      startDate,
      dto.description,
      dto.label,
      endDate,
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
      end_date: task.endDate,
      completed: task.completed,
      label: task.label,
    };
  }

  static toDto(task: Task): UpdateTaskDto {
    const completedDate =
      task.completed && task.completedDate ? formatDateToISO(task.completedDate) : undefined;

    return {
      name: task.name,
      description: task.description,
      startDate: task.startDate ? formatDateToISO(task.startDate) : undefined,
      endDate: task.endDate ? formatDateToISO(task.endDate) : undefined,
      ...(completedDate !== undefined ? { completedDate } : {}),
      label: task.label,
    };
  }

  private static parseDate(dateValue: Date | string | null | undefined): Date | undefined {
    if (!dateValue) return undefined;
    if (dateValue instanceof Date) return dateValue;

    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
}
