export interface ProjectViewModel {
  id: string;
  name: string;
  sections: SectionViewModel[];
}

export interface SectionViewModel {
  id: string;
  name: string;
  taskCount: number;
  tasks: TaskViewModel[];
}

export interface SectionUpdateEvent {
  id: string;
  name: string;
}

export interface SectionDeleteEvent {
  id: string;
}

export interface TaskUpdateEvent {
  id: string;
}

export interface TaskViewModel {
  id: string;
  name: string;
  completed: boolean;
  startDate: Date;
  subtasks: TaskViewModel[];
}
