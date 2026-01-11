import { Section } from '../../domain/entities/section.entity';
import { SectionDto } from '../dto/section.dto';
import { CreateSectionDto } from '../dto/create-section.dto';

export class SectionMapper {
  static toDomain(dto: SectionDto, projectId: string): Section {
    return new Section(
      String(dto.id),
      dto.name,
      projectId,
      dto.tasks.map(t => String(t.id))
    );
  }

  static toCreateDto(section: Section): CreateSectionDto {
    return {
      name: section.name,
    };
  }

  static toDto(section: Section): Partial<SectionDto> {
    return {
      name: section.name,
    };
  }
}
