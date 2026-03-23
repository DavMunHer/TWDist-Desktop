import { HttpClient } from '@angular/common/http';
import { Injectable, inject as inject_1 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { beforeEach, describe, expect, it, afterEach } from 'vitest';

interface UserDto {
  id: string;
  name: string;
}

@Injectable()
class UserApiService {
  private readonly http = inject_1(HttpClient);


  getUserById(id: string) {
    return this.http.get<UserDto>(`/api/users/${id}`);
  }
}

describe('HTTP service template', () => {
  let service: UserApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(UserApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('performs GET and returns expected payload', () => {
    const expected: UserDto = { id: '1', name: 'Ada' };
    let actual: UserDto | undefined;

    service.getUserById('1').subscribe((response) => {
      actual = response;
    });

    const req = httpMock.expectOne('/api/users/1');
    expect(req.request.method).toBe('GET');

    req.flush(expected);

    expect(actual).toEqual(expected);
  });
});
