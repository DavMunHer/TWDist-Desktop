import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';

import { ProjectNameEditorComponent } from './project-name-editor.component';

describe('ProjectNameEditorComponent', () => {
  let component: ProjectNameEditorComponent;
  let fixture: ComponentFixture<ProjectNameEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectNameEditorComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectNameEditorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('name', 'My Project');
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('renders the project name as a display span initially', () => {
    const span: HTMLElement = fixture.nativeElement.querySelector('.project-name-display');
    expect(span).toBeTruthy();
    expect(span.textContent?.trim()).toBe('My Project');
  });

  it('does not show input initially', () => {
    expect(fixture.nativeElement.querySelector('.project-name-input')).toBeNull();
  });

  it('switches to editing mode when display span is clicked', () => {
    fixture.nativeElement.querySelector('.project-name-display').click();
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.project-name-input');
    expect(input).toBeTruthy();
    expect(input.value).toBe('My Project');
    expect(fixture.nativeElement.querySelector('.project-name-display')).toBeNull();
  });

  it('emits nameChange with trimmed value on Enter key', () => {
    const emitSpy = vi.spyOn(component.nameChange, 'emit');
    fixture.nativeElement.querySelector('.project-name-display').click();
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.project-name-input');
    component['nameCtrl'].setValue('  Renamed Project  ');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(emitSpy).toHaveBeenCalledWith('Renamed Project');
    expect(fixture.nativeElement.querySelector('.project-name-display')).toBeTruthy();
  });

  it('does not emit nameChange when name is unchanged', () => {
    const emitSpy = vi.spyOn(component.nameChange, 'emit');
    fixture.nativeElement.querySelector('.project-name-display').click();
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.project-name-input');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('cancels editing on Escape without emitting', () => {
    const emitSpy = vi.spyOn(component.nameChange, 'emit');
    fixture.nativeElement.querySelector('.project-name-display').click();
    fixture.detectChanges();

    component['nameCtrl'].setValue('Something else');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.project-name-input');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.project-name-display')).toBeTruthy();
  });

  it('does not emit when input is invalid (too short)', () => {
    const emitSpy = vi.spyOn(component.nameChange, 'emit');
    fixture.nativeElement.querySelector('.project-name-display').click();
    fixture.detectChanges();

    component['nameCtrl'].setValue('X');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.project-name-input');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.field-error')).toBeTruthy();
  });
});
