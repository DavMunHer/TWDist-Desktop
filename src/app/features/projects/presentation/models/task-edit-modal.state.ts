export interface TaskEditModalState {
  id: string;
  name: string;
  completed?: boolean;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}
