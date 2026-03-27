import { SectionDto } from '@features/projects/infrastructure/dto/section.dto';

export interface ProjectResponseDto {
  id: string;
  name: string;
  favorite: boolean;
  sections?: SectionDto[];
}
