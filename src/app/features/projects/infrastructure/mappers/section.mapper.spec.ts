import { describe, it, expect } from 'vitest';

import { SectionMapper } from './section.mapper';
import { SectionDto } from '@features/projects/infrastructure/dto/section.dto';
import { Section } from '@features/projects/domain/entities/section.entity';

describe('SectionMapper', () => {
  const dto: SectionDto = {
    id: 2,
    name: 'Todo',
    tasks: [{ id: 9, name: 'T', description: '', start_date: new Date(), end_date: new Date(), completed: false }],
  };

  it('toDomain maps ids to strings and task ids', () => {
    const s = SectionMapper.toDomain(dto, 'p1');
    expect(s).toBeInstanceOf(Section);
    expect(s.id).toBe('2');
    expect(s.projectId).toBe('p1');
    expect(s.taskIds).toEqual(['9']);
  });

  it('toCreateDto maps name only', () => {
    const section = new Section('s1', 'Backlog', 'p1', []);
    expect(SectionMapper.toCreateDto(section)).toEqual({ name: 'Backlog' });
  });

  it('toDto maps name', () => {
    const section = new Section('s1', 'Done', 'p1', []);
    expect(SectionMapper.toDto(section)).toEqual({ name: 'Done' });
  });
});
