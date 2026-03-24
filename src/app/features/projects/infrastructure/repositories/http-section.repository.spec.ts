import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';

import { HttpSectionRepository } from './http-section.repository';
import { Section } from '@features/projects/domain/entities/section.entity';
import { SectionDto } from '@features/projects/infrastructure/dto/section.dto';

describe('HttpSectionRepository', () => {
  let repository: HttpSectionRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(), HttpSectionRepository],
    });
    httpMock = TestBed.inject(HttpTestingController);
    repository = TestBed.inject(HttpSectionRepository);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('create posts to nested section create URL', () => {
    const section = new Section('s1', 'New', 'p9', []);
    repository.create(section).subscribe();
    const req = httpMock.expectOne('/projects/p9/section/create');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'New' });
    const dto: SectionDto = { id: 1, name: 'New', tasks: [] };
    req.flush(dto);
  });

  it('delete sends DELETE to section delete URL', () => {
    repository.delete('p1', 's1').subscribe();
    const req = httpMock.expectOne('/projects/p1/section/s1/delete');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('findById GETs section', () => {
    repository.findById('p1', 's1').subscribe();
    const req = httpMock.expectOne('/projects/p1/section/s1/get');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1, name: 'S', tasks: [] });
  });
});
