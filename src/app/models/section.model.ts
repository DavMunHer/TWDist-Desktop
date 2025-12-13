
export interface TWDSection {
    id: string,
    name: string,
    projectId: string,
    tasksIds: string[]
}

export type TWDSectionsRecord = Record<string, TWDSection>