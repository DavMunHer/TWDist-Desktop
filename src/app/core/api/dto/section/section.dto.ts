import { TaskDto } from "../task/task.dto";

export interface SectionDto {
    id: number,
    name: string,
    tasks: TaskDto[]
}