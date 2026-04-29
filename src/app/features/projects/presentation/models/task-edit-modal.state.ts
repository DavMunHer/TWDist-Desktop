export interface TaskEditModalState {
  id: string;
  name: string;
  completed?: boolean;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface TaskEditModalResult {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  completed: boolean;
}
