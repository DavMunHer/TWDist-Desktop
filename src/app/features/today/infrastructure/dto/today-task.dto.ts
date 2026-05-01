export interface TodayTaskDto {
  id: number;
  name: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  completedDate: string | null;
  sectionId: number;
  projectId: number;
  projectName: string;
}

