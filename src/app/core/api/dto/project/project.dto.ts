import { SectionDto } from "../section/section.dto";

export interface ProjectDto {
    id: number,
    name: string,
    favorite: boolean,
    sections: SectionDto[]
}
