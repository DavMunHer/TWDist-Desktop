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

export interface TaskToggleEvent {
  id: string;
}

export interface TaskCreateEvent {
  sectionId: string;
  name: string;
}

export interface TaskRenameEvent {
  id: string;
  name: string;
}

export interface TaskDeleteEvent {
  id: string;
  sectionId: string;
}

export interface TaskEditEvent {
  id: string;
  sectionId: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  completedChanged: boolean;
}

export interface TaskViewModel {
  id: string;
  name: string;
  completed: boolean;
  startDate: Date | undefined;
  description?: string;
  endDate?: Date;
  subtasks: TaskViewModel[];
}
