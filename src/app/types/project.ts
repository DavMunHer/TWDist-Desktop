import { TWDSection } from "./section";

export interface TWDProject {
    id: number
    name: string,
    sectionsList: TWDSection[]
}

export interface PartialTWDProject {
    id: number,
    name: string,
    favorite: boolean
}