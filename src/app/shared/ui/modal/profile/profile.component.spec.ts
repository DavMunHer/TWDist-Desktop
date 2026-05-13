import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';

import { ProfileComponent } from '@shared/ui/modal/profile/profile.component';
import { AuthStore } from '@features/auth/presentation/store/auth.store';
import { User } from '@features/auth/domain/entities/user.entity';
import { AuthUiError } from '@features/auth/presentation/models/auth-ui-error';

const mockUser = new User('1', 'test@example.com', 'TestUser');

function createMockAuthStore() {
  return {
    user: signal<User | null>(mockUser),
    profileStatus: signal<'idle' | 'loading' | 'success' | 'error'>('idle'),
    profileError: signal<AuthUiError | null>(null),
    updateUsername: vi.fn(),
    updatePassword: vi.fn(),
    resetProfileStatus: vi.fn(),
  };
}

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockAuthStore: ReturnType<typeof createMockAuthStore>;

  beforeEach(async () => {
    mockAuthStore = createMockAuthStore();

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthStore, useValue: mockAuthStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('username form', () => {
    it('prefills the username from the store', () => {
      expect(component.usernameForm.value.username).toBe('TestUser');
    });

    it('is invalid when username is empty', () => {
      component.usernameForm.patchValue({ username: '' });
      expect(component.usernameForm.invalid).toBe(true);
    });

    it('is invalid when username is shorter than 3 characters', () => {
      component.usernameForm.patchValue({ username: 'ab' });
      expect(component.usernameForm.invalid).toBe(true);
    });

    it('is valid with a username of 3+ characters', () => {
      component.usernameForm.patchValue({ username: 'abc' });
      expect(component.usernameForm.valid).toBe(true);
    });

    it('calls authStore.updateUsername on submit with valid form', () => {
      component.usernameForm.patchValue({ username: 'NewName' });
      component.submitUsername();
      expect(mockAuthStore.updateUsername).toHaveBeenCalledWith('NewName');
    });

    it('does not call authStore.updateUsername on submit with invalid form', () => {
      component.usernameForm.patchValue({ username: '' });
      component.submitUsername();
      expect(mockAuthStore.updateUsername).not.toHaveBeenCalled();
    });
  });

  describe('password form', () => {
    it('is invalid when both fields are empty', () => {
      expect(component.passwordForm.invalid).toBe(true);
    });

    it('is invalid when newPassword is shorter than 8 characters', () => {
      component.passwordForm.patchValue({ oldPassword: 'OldPass1', newPassword: 'short' });
      expect(component.passwordForm.get('newPassword')!.invalid).toBe(true);
    });

    it('is valid with correct old and new passwords', () => {
      component.passwordForm.patchValue({ oldPassword: 'OldPass1', newPassword: 'NewPass123' });
      expect(component.passwordForm.valid).toBe(true);
    });

    it('is invalid when old and new passwords are the same', () => {
      component.passwordForm.patchValue({ oldPassword: 'SamePass1', newPassword: 'SamePass1' });
      expect(component.passwordForm.errors).toEqual({ passwordsMustDiffer: true });
    });

    it('calls authStore.updatePassword on submit with valid form', () => {
      component.passwordForm.patchValue({ oldPassword: 'OldPass1', newPassword: 'NewPass123' });
      component.submitPassword();
      expect(mockAuthStore.updatePassword).toHaveBeenCalledWith('OldPass1', 'NewPass123');
    });

    it('does not call authStore.updatePassword on submit with invalid form', () => {
      component.passwordForm.patchValue({ oldPassword: '', newPassword: '' });
      component.submitPassword();
      expect(mockAuthStore.updatePassword).not.toHaveBeenCalled();
    });
  });

  describe('profile status feedback', () => {
    it('exposes profileStatus from the store', () => {
      expect(component.profileStatus()).toBe('idle');
      mockAuthStore.profileStatus.set('loading');
      expect(component.profileStatus()).toBe('loading');
    });

    it('exposes profileError from the store', () => {
      expect(component.profileError()).toBeNull();
      const error: AuthUiError = { code: 'INVALID_OLD_PASSWORD', kind: 'auth', message: 'Old password is incorrect', retryable: false };
      mockAuthStore.profileError.set(error);
      expect(component.profileError()).toEqual(error);
    });

    it('resets the password form when profileStatus becomes success', () => {
      component.passwordForm.patchValue({ oldPassword: 'OldPass1', newPassword: 'NewPass123' });
      mockAuthStore.profileStatus.set('success');
      TestBed.flushEffects();
      expect(component.passwordForm.value).toEqual({ oldPassword: null, newPassword: null });
    });
  });

  describe('lifecycle', () => {
    it('calls resetProfileStatus on destroy', () => {
      fixture.destroy();
      expect(mockAuthStore.resetProfileStatus).toHaveBeenCalled();
    });
  });
});
