export interface TWDProject {
    id: string
    name: string,
    sectionIds: string[]
}

export interface PartialTWDProject {
    id: string,
    name: string,
    favorite: boolean
}