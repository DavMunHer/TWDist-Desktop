import { SectionDto } from '../dto/section.dto';

export interface ProjectDto {
  id: number;
  name: string;
  favorite: boolean;
  sections: SectionDto[];
}
