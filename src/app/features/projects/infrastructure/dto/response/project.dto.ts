import { SectionDto } from '@features/projects/infrastructure/dto/section.dto';

export interface ProjectResponeDto {
  id: string;
  name: string;
  favorite: boolean;
  sections?: SectionDto[];
}
