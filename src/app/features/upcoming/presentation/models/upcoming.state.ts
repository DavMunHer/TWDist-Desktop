import { UpcomingTaskAggregate } from '@features/upcoming/domain/models/upcoming-task.aggregate';

export interface UpcomingState {
  selectedWeekStart: Date;
  aggregates: UpcomingTaskAggregate[];
  loading: boolean;
  error: string | null;
}

export const initialUpcomingState = (selectedWeekStart: Date): UpcomingState => ({
  selectedWeekStart,
  aggregates: [],
  loading: false,
  error: null,
});
