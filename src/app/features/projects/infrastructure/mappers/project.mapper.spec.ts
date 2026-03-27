import { describe, it, expect } from 'vitest';

import { ProjectMapper } from './project.mapper';
import { ProjectResponseDto } from '@features/projects/infrastructure/dto/response/project.dto';
import { ProjectSummaryDto } from '@features/projects/infrastructure/dto/response/project-summary.dto';
import { Project } from '@features/projects/domain/entities/project.entity';
import { ProjectName } from '@features/projects/domain/value-objects/project-name.value-object';

describe('ProjectMapper', () => {
  const fullDto: ProjectResponseDto = {
    id: '10',
    name: 'App',
    favorite: true,
    sections: [
      {
        id: 1,
        name: 'S1',
        tasks: [
          {
            id: 100,
            name: 'Root',
            description: '',
            start_date: new Date(),
            end_date: new Date(),
            completed: false,
            subtasks: [],
          },
        ],
      },
    ],
  };

  it('toDomain maps id to string and collects section ids', () => {
    const p = ProjectMapper.toDomain(fullDto);
    expect(p).toBeInstanceOf(Project);
    expect(p.id).toBe('10');
    expect(p.name).toBeInstanceOf(ProjectName);
    expect(p.name.value).toBe('App');
    expect(p.favorite).toBe(true);
    expect(p.sectionIds).toEqual(['1']);
  });

  it('toAggregate returns project, sections, and flattened tasks', () => {
    const agg = ProjectMapper.toAggregate(fullDto);
    expect(agg.project.id).toBe('10');
    expect(agg.sections.length).toBe(1);
    expect(agg.sections[0].id).toBe('1');
    expect(agg.tasks.some((t) => t.id === '100')).toBe(true);
  });

  it('toSummary maps summary dto', () => {
    const dto: ProjectSummaryDto = { id: '5', name: 'XX', favorite: false, pendingCount: 3 };
    const s = ProjectMapper.toSummary(dto);
    expect(s.project.id).toBe('5');
    expect(s.project.name.value).toBe('XX');
    expect(s.pendingCount).toBe(3);
  });

  it('toDto maps name and favorite', () => {
    const p = new Project('1', ProjectName.create('NN'), true, []);
    expect(ProjectMapper.toDto(p)).toEqual({ name: 'NN', favorite: true });
  });
});
