import { Task } from '@features/projects/domain/entities/task.entity';
import { UpcomingTaskAggregate } from '@features/upcoming/domain/models/upcoming-task.aggregate';
import { UpcomingTaskDto } from '@features/upcoming/infrastructure/dto/upcoming-task.dto';

export class UpcomingTaskMapper {
  static toDomainAggregates(dtos: UpcomingTaskDto[]): UpcomingTaskAggregate[] {
    return dtos.map((dto) => {
      const task = new Task(
        String(dto.id),
        String(dto.sectionId),
        dto.name,
        false,
        this.parseDate(dto.startDate),
        dto.description,
        undefined,
        this.parseDate(dto.endDate),
        undefined,
        undefined,
        [],
      );

      return {
        task,
        projectId: String(dto.projectId),
        projectName: dto.projectName,
      };
    });
  }

  private static parseDate(value: string | null): Date | undefined {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
}
