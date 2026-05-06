import { TodayTaskAggregate } from '@features/today/domain/models/today-task.aggregate';

export interface UpcomingState {
  selectedWeekStart: Date;
  aggregates: TodayTaskAggregate[];
}

export const initialUpcomingState = (selectedWeekStart: Date): UpcomingState => ({
  selectedWeekStart,
  aggregates: [],
});
