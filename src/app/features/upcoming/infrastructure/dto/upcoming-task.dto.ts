export interface UpcomingTaskDto {
  id: number;
  name: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  sectionId: number;
  projectId: number;
  projectName: string;
}
