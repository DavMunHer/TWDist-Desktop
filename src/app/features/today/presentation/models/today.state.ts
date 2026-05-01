import { TodayTaskAggregate } from '@features/today/domain/models/today-task.aggregate';

export interface TodayState {
  aggregates: TodayTaskAggregate[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

export const initialTodayState: TodayState = {
  aggregates: [],
  loading: false,
  loaded: false,
  error: null,
};

