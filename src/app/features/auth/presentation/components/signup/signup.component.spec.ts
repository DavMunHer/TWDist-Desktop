import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal, provideZonelessChangeDetection } from '@angular/core';
import { vi } from 'vitest';

import { SignupComponent } from '@features/auth/presentation/components/signup/signup.component';
import { AuthStore } from '@features/auth/presentation/store/auth.store';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  function createMockAuthStore() {
    return {
      isAuthenticated: signal(false),
      isRegistrationSuccess: signal(false),
      isLoading: signal(false),
      error: signal<string | null>(null),
      signup: vi.fn(),
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthStore, useValue: createMockAuthStore() }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
