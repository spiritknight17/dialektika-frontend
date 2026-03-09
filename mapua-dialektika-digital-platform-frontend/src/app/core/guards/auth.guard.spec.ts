import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthService],
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('allows when logged in', () => {
    authService.accessToken.set('token');

    const result = guard.canActivate({} as any, { url: '/dialektika-board' } as any);

    expect(result).toBe(true);
  });

  it('blocks when not logged in', () => {
    authService.accessToken.set(null);

    const result = guard.canActivate({} as any, { url: '/mc-dialektika-board' } as any);

    expect(result).not.toBe(true);
  });
});
