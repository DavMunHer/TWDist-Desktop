import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';

import { SectionStore } from './section.store';
import { CreateSectionUseCase } from '@features/projects/application/use-cases/sections/create-section/create-section.use-case';
import { TaskStore } from './task.store';
import { Section } from '@features/projects/domain/entities/section.entity';

describe('SectionStore', () => {
  let store: SectionStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        SectionStore,
        { provide: CreateSectionUseCase, useValue: { execute: vi.fn() } },
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
});
