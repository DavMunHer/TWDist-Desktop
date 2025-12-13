export interface ProjectView {
    id: string,
    name: string,
    sectionsList: SectionView[]
}

export interface SectionView {
    id: string,
    name: string,
    tasksList: TaskView[]
}

export interface TaskView {
    id: string,
    taskName: string,
    completed: boolean,
    startDate: Date
}