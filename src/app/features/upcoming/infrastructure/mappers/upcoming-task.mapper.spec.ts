import { describe, expect, it } from 'vitest';
import { UpcomingTaskMapper } from '@features/upcoming/infrastructure/mappers/upcoming-task.mapper';

describe('UpcomingTaskMapper', () => {
  it('maps dto rows to domain aggregates', () => {
    const aggregates = UpcomingTaskMapper.toDomainAggregates([
      {
        id: 1,
        name: 'Prepare sprint planning',
        description: 'Gather estimations',
        startDate: '2026-05-07',
        endDate: '2026-05-08',
        sectionId: 10,
        projectId: 20,
        projectName: 'Roadmap',
      },
    ]);

    expect(aggregates).toHaveLength(1);
    expect(aggregates[0].projectId).toBe('20');
    expect(aggregates[0].projectName).toBe('Roadmap');
    expect(aggregates[0].task.id).toBe('1');
    expect(aggregates[0].task.completed).toBe(false);
    expect(aggregates[0].task.sectionId).toBe('10');
  });

  it('handles invalid dates as undefined', () => {
    const aggregates = UpcomingTaskMapper.toDomainAggregates([
      {
        id: 2,
        name: 'Task with bad date',
        description: '',
        startDate: 'not-a-date',
        endDate: null,
        sectionId: 11,
        projectId: 22,
        projectName: 'Backend',
      },
    ]);

    expect(aggregates[0].task.startDate).toBeUndefined();
    expect(aggregates[0].task.endDate).toBeUndefined();
  });
});
