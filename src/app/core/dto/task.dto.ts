export interface TaskDto {
    id: number,
    name: string,
    description: string,
    start_date: Date,
    end_date: Date,
    completed: boolean,
    label?: string
}