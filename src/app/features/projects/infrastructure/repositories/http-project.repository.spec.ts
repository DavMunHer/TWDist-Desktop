import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';

import { HttpProjectRepository } from './http-project.repository';
import { ProjectResponeDto } from '@features/projects/infrastructure/dto/response/project.dto';
import { ProjectSummaryDto } from '@features/projects/infrastructure/dto/response/project-summary.dto';
import { Project } from '@features/projects/domain/entities/project.entity';
import { ProjectName } from '@features/projects/domain/value-objects/project-name.value-object';

/**
 * Vitest/esbuild: constructor DI metadata may be missing — construct repository with HttpClient from TestBed.
 */
describe('HttpProjectRepository', () => {
  let repository: HttpProjectRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(), HttpProjectRepository],
    });
    httpMock = TestBed.inject(HttpTestingController);
    repository = TestBed.inject(HttpProjectRepository);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('create posts ProjectMapper body and maps response', () => {
    const project = Project.create(ProjectName.create('NN'), false);
    const response: ProjectResponeDto = { id: '1', name: 'NN', favorite: false, sections: [] };
    let result: unknown;
    repository.create(project).subscribe((p) => (result = p));
    const req = httpMock.expectOne('/projects/create');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'NN', favorite: false });
    req.flush(response);
    expect((result as { id: string }).id).toBe('1');
  });

  it('findById GETs /projects/:id and maps aggregate', () => {
    const response: ProjectResponeDto = {
      id: '7',
      name: 'PP',
      favorite: true,
      sections: [],
    };
    repository.findById('7').subscribe();
    const req = httpMock.expectOne('/projects/7');
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('getAll GETs /projects/get', () => {
    const list: ProjectSummaryDto[] = [
      { id: '1', name: 'AA', favorite: false, pendingCount: 0 },
    ];
    repository.getAll().subscribe();
    const req = httpMock.expectOne('/projects/get');
    expect(req.request.method).toBe('GET');
    req.flush(list);
  });

  it('delete sends DELETE to /projects/:id/delete', () => {
    repository.delete('x').subscribe();
    const req = httpMock.expectOne('/projects/x/delete');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('toggleFavorite PUTs body to /projects/:id/favorite', () => {
    repository.toggleFavorite('p1', true).subscribe();
    const req = httpMock.expectOne('/projects/p1/favorite');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ favorite: true });
    req.flush(null);
  });
});
