import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { signal, provideZonelessChangeDetection } from '@angular/core';

import { LoginComponent } from './login.component';
import { AuthStore } from '@features/auth/presentation/store/auth.store';

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Builds a fresh mock AuthStore for each test to avoid shared signal state. */
function createMockAuthStore() {
  return {
    isAuthenticated: signal(false),
    isLoading: signal(false),
    error: signal<string | null>(null),
    login: vi.fn(),
  };
}

// ─── Suite ─────────────────────────────────────────────────────────────────────

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthStore: ReturnType<typeof createMockAuthStore>;
  let router: Router;

  beforeEach(async () => {
    // Resolve templateUrl/styleUrl after LoginComponent has been imported
    mockAuthStore = createMockAuthStore();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: 'projects/upcoming', component: LoginComponent }]),
        { provide: AuthStore, useValue: mockAuthStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  // ── Creation ──────────────────────────────────────────────────────────────

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  // ── Form validation ───────────────────────────────────────────────────────

  describe('Form validation', () => {
    it('is invalid when empty', () => {
      expect((component as any).loginForm.invalid).toBe(true);
    });

    it('email control is invalid with a bad format', () => {
      (component as any).loginForm.setValue({ email: 'not-an-email', password: 'password123' });
      expect((component as any).loginForm.controls.email.invalid).toBe(true);
    });

    it('email control is invalid when empty', () => {
      (component as any).loginForm.setValue({ email: '', password: 'password123' });
      expect((component as any).loginForm.controls.email.invalid).toBe(true);
    });

    it('password control is invalid when shorter than 8 characters', () => {
      (component as any).loginForm.setValue({ email: 'test@test.com', password: 'short' });
      expect((component as any).loginForm.controls.password.invalid).toBe(true);
    });

    it('password control is invalid when empty', () => {
      (component as any).loginForm.setValue({ email: 'test@test.com', password: '' });
      expect((component as any).loginForm.controls.password.invalid).toBe(true);
    });

    it('is valid with a correct email and a password of at least 8 characters', () => {
      (component as any).loginForm.setValue({ email: 'test@test.com', password: 'password123' });
      expect((component as any).loginForm.valid).toBe(true);
    });
  });

  // ── login() method ────────────────────────────────────────────────────────

  describe('login() method', () => {
    it('does NOT call authStore.login() when the form is invalid', () => {
      (component as any).login();
      expect(mockAuthStore.login).not.toHaveBeenCalled();
    });

    it('calls authStore.login() with the correct LoginCredentialsDto when valid', () => {
      (component as any).loginForm.setValue({ email: 'test@test.com', password: 'password123' });
      (component as any).login();

      expect(mockAuthStore.login).toHaveBeenCalledOnce();
      expect(mockAuthStore.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
    });

    it('can also be triggered by submitting the form element', () => {
      (component as any).loginForm.setValue({ email: 'test@test.com', password: 'password123' });

      const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(mockAuthStore.login).toHaveBeenCalledOnce();
    });
  });

  // ── Loading state ─────────────────────────────────────────────────────────

  describe('Loading state (isLoading signal)', () => {
    it('disables the submit button while isLoading is true', () => {
      mockAuthStore.isLoading.set(true);
      fixture.detectChanges();

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(button.disabled).toBe(true);
    });

    it('shows "Logging in..." text while loading', () => {
      mockAuthStore.isLoading.set(true);
      fixture.detectChanges();

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(button.textContent?.trim()).toBe('Logging in...');
    });

    it('shows the default "Login" label when not loading', () => {
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(button.textContent?.trim()).toBe('Login');
    });

    it('re-enables the submit button once loading finishes', () => {
      mockAuthStore.isLoading.set(true);
      fixture.detectChanges();

      mockAuthStore.isLoading.set(false);
      fixture.detectChanges();

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(button.disabled).toBe(false);
    });
  });

  // ── Error message ─────────────────────────────────────────────────────────

  describe('Error message (errorMessage signal)', () => {
    it('is visible when errorMessage is a non-empty string', () => {
      mockAuthStore.error.set('Invalid email or password');
      fixture.detectChanges();

      const errorEl: HTMLElement = fixture.nativeElement.querySelector('.login-error');
      expect(errorEl.style.visibility).toBe('visible');
    });

    it('renders the error text content', () => {
      mockAuthStore.error.set('Invalid email or password');
      fixture.detectChanges();

      const errorEl: HTMLElement = fixture.nativeElement.querySelector('.login-error');
      expect(errorEl.textContent).toContain('Invalid email or password');
    });

    it('is hidden when errorMessage is null', () => {
      mockAuthStore.error.set(null);
      fixture.detectChanges();

      const errorEl: HTMLElement = fixture.nativeElement.querySelector('.login-error');
      expect(errorEl.style.visibility).toBe('hidden');
    });

    it('transitions from visible to hidden when error is cleared', () => {
      mockAuthStore.error.set('Some error');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.login-error').style.visibility).toBe('visible');

      mockAuthStore.error.set(null);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.login-error').style.visibility).toBe('hidden');
    });
  });

  // ── Redirect effect ───────────────────────────────────────────────────────

  describe('Redirect effect (isAuthenticated signal)', () => {
    it('navigates to /projects/upcoming when isAuthenticated becomes true', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      mockAuthStore.isAuthenticated.set(true);
      // Angular 19.2+ utility that flushes all pending reactive effects synchronously
      TestBed.flushEffects();

      expect(navigateSpy).toHaveBeenCalledWith(['/projects/upcoming']);
    });

    it('does NOT navigate when isAuthenticated is false', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      mockAuthStore.isAuthenticated.set(false);
      TestBed.flushEffects();

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });
});
