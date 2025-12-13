import { TestBed } from '@angular/core/testing';

import { ProjectStoreService } from './project-store.service';

describe('ProjectStoreService', () => {
  let service: ProjectStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
