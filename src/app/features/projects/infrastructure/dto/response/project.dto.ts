import { SectionDto } from '../section.dto';

export interface ProjectResponeDto {
  id: string;
  name: string;
  favorite: boolean;
  sections?: SectionDto[];
}
