import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileComponent } from '@shared/ui/modal/profile/profile.component';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { AuthStore } from '@features/auth/presentation/store/auth.store';
import { User } from '@features/auth/domain/entities/user.entity';

const mockUser = new User('1', 'test@example.com', 'TestUser');
const mockAuthStore = { user: signal<User | null>(mockUser) };

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthStore, useValue: mockAuthStore },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
