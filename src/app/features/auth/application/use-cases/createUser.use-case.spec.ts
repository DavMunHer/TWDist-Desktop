import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { CreateUserUseCase } from './createUser.use-case';
import { AuthRepository } from '@features/auth/domain/repositories/auth.repository';
import { RegisterCredentialsDto } from '@features/auth/infrastructure/dto/request/register-credentials.dto';
import { User } from '@features/auth/domain/entities/user.entity';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let authRepositoryMock: Partial<AuthRepository>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
  };

  const dto: RegisterCredentialsDto = {
    email: 'test@example.com',
    password: 'password123',
    username: 'testuser',
  };

  beforeEach(() => {
    authRepositoryMock = {
      register: vi.fn().mockReturnValue(of(mockUser)),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CreateUserUseCase,
        { provide: AuthRepository, useValue: authRepositoryMock },
      ],
    });

    useCase = TestBed.inject(CreateUserUseCase);
  });

  it('creates the use case', () => {
    expect(useCase).toBeTruthy();
  });

  it('delegates execution to authRepository.register() with the given credentials', () => {
    useCase.execute(dto);
    expect(authRepositoryMock.register).toHaveBeenCalledWith(dto);
  });

  it('returns the observable emitted by the repository', () => {
    useCase.execute(dto).subscribe((result) => {
      expect(result).toEqual(mockUser);
    });
  });
});
