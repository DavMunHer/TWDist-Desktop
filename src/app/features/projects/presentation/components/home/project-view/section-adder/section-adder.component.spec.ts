import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SectionAdderComponent } from '@features/projects/presentation/components/home/project-view/section-adder/section-adder.component';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ProjectStore } from '@features/projects/presentation/store/project.store';

describe('SectionAdderComponent', () => {
  let component: SectionAdderComponent;
  let fixture: ComponentFixture<SectionAdderComponent>;

  const projectStoreMock = {
    projects: signal([]),
    selectedProjectId: signal<string | null>(null),
    loadAllProjects: vi.fn(),
    loadProject: vi.fn(),
    toggleProjectFavorite: vi.fn(),
    deleteProject: vi.fn(),
    disconnectFromEvents: vi.fn(),
    createSection: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [SectionAdderComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProjectStore, useValue: projectStoreMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionAdderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('shows add-section affordance initially', () => {
    const addBtn = fixture.nativeElement.querySelector('.add-section-button-container');
    expect(addBtn).toBeTruthy();
    expect(fixture.nativeElement.querySelector('form.new-section-container')).toBeFalsy();
  });

  it('opens the form when add section is clicked', () => {
    fixture.nativeElement.querySelector('.add-section-button-container')?.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('form.new-section-container')).toBeTruthy();
  });

  it('does not call createSection when name is empty on submit', () => {
    fixture.nativeElement.querySelector('.add-section-button-container')?.click();
    fixture.detectChanges();
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(projectStoreMock.createSection).not.toHaveBeenCalled();
  });

  it('calls createSection, resets control, and closes form on valid submit', () => {
    fixture.nativeElement.querySelector('.add-section-button-container')?.click();
    fixture.detectChanges();
    component['newSectionNameCtrl'].setValue('  New section  ');
    fixture.detectChanges();

    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(projectStoreMock.createSection).toHaveBeenCalledOnce();
    expect(projectStoreMock.createSection).toHaveBeenCalledWith('New section');
    expect(component['newSectionNameCtrl'].value).toBe('');
    expect(fixture.nativeElement.querySelector('.add-section-button-container')).toBeTruthy();
  });

  it('closes form on cancel without creating a section', () => {
    fixture.nativeElement.querySelector('.add-section-button-container')?.click();
    fixture.detectChanges();
    component['newSectionNameCtrl'].setValue('Aborted');
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.section-cancel-btn')?.click();
    fixture.detectChanges();

    expect(projectStoreMock.createSection).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('form.new-section-container')).toBeFalsy();
  });
});
