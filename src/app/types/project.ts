import { TWDSection } from "./section";

export interface TWDProject {
    name: string,
    sectionsList: TWDSection[]
}

export interface PartialTWDProject {
    name: string,
    favorite: boolean
}