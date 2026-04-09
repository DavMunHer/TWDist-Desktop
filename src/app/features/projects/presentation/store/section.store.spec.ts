import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

import { SectionStore } from './section.store';
import { CreateSectionUseCase } from '@features/projects/application/use-cases/sections/create-section/create-section.use-case';
import { UpdateSectionUseCase } from '@features/projects/application/use-cases/sections/update-section/update-section.use-case';
import { DeleteSectionUseCase } from '@features/projects/application/use-cases/sections/delete-section/delete-section.use-case';
import { TaskStore } from './task.store';
import { Section } from '@features/projects/domain/entities/section.entity';

describe('SectionStore', () => {
  let store: SectionStore;
  const createSectionExecute = vi.fn();
  const updateSectionExecute = vi.fn();
  const deleteSectionExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    createSectionExecute.mockReturnValue(of({ success: true, value: new Section('s1', 'Backlog', 'p1', []) }));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        SectionStore,
        { provide: CreateSectionUseCase, useValue: { execute: createSectionExecute } },
        { provide: UpdateSectionUseCase, useValue: { execute: updateSectionExecute } },
        { provide: DeleteSectionUseCase, useValue: { execute: deleteSectionExecute } },
        {
          provide: TaskStore,
          useValue: { tasks: signal<Record<string, unknown>>({}).asReadonly() },
        },
      ],
    });
    store = TestBed.inject(SectionStore);
  });

  it('mergeSections adds sections to dictionary', () => {
    const a = new Section('s1', 'Alpha', 'p1', []);
    const b = new Section('s2', 'Beta', 'p1', []);
    store.mergeSections([a, b]);
    expect(store.sections()['s1']?.name).toBe('Alpha');
    expect(store.sections()['s2']?.name).toBe('Beta');
  });

  it('createSection saves created section on success result', () => {
    store.createSection('p1', 'Backlog');

    expect(createSectionExecute).toHaveBeenCalledWith('p1', 'Backlog');
    expect(store.sections()['s1']?.name).toBe('Backlog');
  });

  it('createSection stores mapped error message on failure result', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    createSectionExecute.mockReturnValue(of({ success: false, error: { code: 'SECTION_NAME_REQUIRED' } }));

    store.createSection('p1', '');

    expect(store.error()).toBe('Section name is required');
    errorSpy.mockRestore();
  });
});
