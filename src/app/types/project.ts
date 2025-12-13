import { TWDSection } from "./section";

export interface TWDProject {
    id: string
    name: string,
    sectionsList: TWDSection[]
}

export interface PartialTWDProject {
    id: string,
    name: string,
    favorite: boolean
}