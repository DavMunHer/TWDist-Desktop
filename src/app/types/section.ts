import { TWDTask } from "./task";

export interface TWDSection {
    id: number,
    name: string,
    tasksList: TWDTask[]
}