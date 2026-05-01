import { Task } from '@features/projects/domain/entities/task.entity';
import { TodayTaskAggregate } from '@features/today/domain/models/today-task.aggregate';
import { TodayTaskDto } from '@features/today/infrastructure/dto/today-task.dto';

export class TodayTaskMapper {
  static toDomainAggregates(dtos: TodayTaskDto[]): TodayTaskAggregate[] {
    return dtos.map((dto) => {
      const completedDate = this.parseDate(dto.completedDate);
      const completed = completedDate !== undefined;

      const task = new Task(
        String(dto.id),
        String(dto.sectionId),
        dto.name,
        completed,
        this.parseDate(dto.startDate),
        dto.description,
        undefined,
        this.parseDate(dto.endDate),
        completedDate,
        undefined,
        [],
      );

      return {
        task,
        projectId: String(dto.projectId),
      };
    });
  }

  private static parseDate(value: string | null): Date | undefined {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
}

