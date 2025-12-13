export interface TWDTask {
    id: string,
    taskName: string,
    completed: boolean,
    startDate: Date,
    description?: string,
    label?: string // Should actually be an enum of the user created labels (tags)
    end_date?: Date
    completed_date?: Date    
}