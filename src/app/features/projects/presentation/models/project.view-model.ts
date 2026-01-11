export interface ProjectViewModel {
  id: string;
  name: string;
  sections: SectionViewModel[];
}

export interface SectionViewModel {
  id: string;
  name: string;
  tasks: TaskViewModel[];
}

export interface TaskViewModel {
  id: string;
  name: string;
  completed: boolean;
  startDate: Date;
}
