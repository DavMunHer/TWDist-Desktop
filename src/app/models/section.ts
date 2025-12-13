import { TWDTask } from "./task";

export interface TWDSection {
    id: string,
    name: string,
    tasksList: TWDTask[]
}