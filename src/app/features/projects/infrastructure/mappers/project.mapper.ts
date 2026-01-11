import { Project } from '../../domain/entities/project.entity';
import { Section } from '../../domain/entities/section.entity';
import { Task } from '../../domain/entities/task.entity';
import { ProjectDto } from '../dto/project.dto';
import { SectionDto } from '../dto/section.dto';
import { TaskDto } from '../dto/task.dto';

export class ProjectMapper {
  static toDomain(dto: ProjectDto): {
    project: Project;
    sections: Section[];
    tasks: Task[];
  } {
    const projectId = String(dto.id);
    const sections: Section[] = [];
    const tasks: Task[] = [];

    for (const sectionDto of dto.sections) {
      const result = this.sectionToDomain(sectionDto, projectId);
      sections.push(result.section);
      tasks.push(...result.tasks);
    }

    return {
      project: new Project(
        projectId,
        dto.name,
        sections.map(s => s.id)
      ),
      sections,
      tasks,
    };
  }

  private static sectionToDomain(
    dto: SectionDto,
    projectId: string
  ): {
    section: Section;
    tasks: Task[];
  } {
    const sectionId = String(dto.id);
    const tasks = dto.tasks.map(t => this.taskToDomain(t, sectionId));

    return {
      section: new Section(
        sectionId,
        dto.name,
        projectId,
        tasks.map(t => t.id)
      ),
      tasks,
    };
  }

  private static taskToDomain(dto: TaskDto, sectionId: string): Task {
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

  static toDto(project: Project): Partial<ProjectDto> {
    return {
      name: project.name,
    };
  }
}
